import User from "../../models/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendOTPVerificationEmail,
  sendWelcomeEmailAfterVerification,
} from "../../services/emailService.js";
import { assignUniqueIdToUser } from "../../services/idGeneratorService.js";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecret";
const JWT_EXPIRES_IN = "7d";

const verifyRecaptcha = async (token) => {
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

export const register = async (req, res) => {
  try {
    console.log("📝 Registration request received:", {
      body: req.body,
      hasRecaptcha: !!req.body.recaptchaToken,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      hasFirstName: !!req.body.firstName,
    });

    const { recaptchaToken, ...userData } = req.body;
    const { email, password, firstName, phone, lastName } = userData;

    if (!email) {
      console.log("❌ Missing email field");
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      console.log("❌ Missing password field");
      return res.status(400).json({ error: "Password is required" });
    }
    if (!firstName) {
      console.log("❌ Missing firstName field");
      return res.status(400).json({ error: "Name is required" });
    }
    console.log("✅ All required fields present");

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      console.log("❌ reCAPTCHA token missing");
      return res.status(400).json({ error: "reCAPTCHA verification required" });
    }

    console.log("🔍 Verifying reCAPTCHA...");
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      console.log("❌ reCAPTCHA verification failed");
      return res.status(400).json({
        error: "reCAPTCHA verification failed. Please try again.",
        recaptchaError: true,
      });
    }
    console.log("✅ reCAPTCHA verified successfully");

    console.log("🔍 Checking for existing user...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email already registered:", email);
      return res.status(400).json({ error: "Email already registered" });
    }
    console.log("✅ Email is available");

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName: lastName || "",
      email,
      phone,
      password,
      emailVerificationOTP: otpCode,
      emailVerificationOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      trial: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
      },
      isNewUser: true,
      socialMediaLogin: false,
    });

    await user.save();

    // Assign unique ID and create folder for new user
    try {
      await assignUniqueIdToUser(user._id);
      console.log(
        `✅ Assigned unique ID to new registered user: ${user.email}`
      );
    } catch (idError) {
      console.error(
        `❌ Failed to assign unique ID to new user ${user.email}: ${idError.message}`
      );
      // Don't block registration if ID assignment fails
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Send OTP verification email
    try {
      await sendOTPVerificationEmail(user.email, user.firstName, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for OTP verification.",
      user: {
        ...user.toObject(),
        password: undefined,
        emailVerificationOTP: undefined,
      },
      token,
      needsOTPVerification: true,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken, isOtpLogin } = req.body;

    // Bypass reCAPTCHA for OTP-based login
    if (!isOtpLogin) {
      if (!recaptchaToken) {
        return res
          .status(400)
          .json({ error: "reCAPTCHA verification required" });
      }

      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({
          error: "reCAPTCHA verification failed. Please try again.",
          recaptchaError: true,
        });
      }
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isEmailVerified && !user.socialMediaLogin) {
      return res.status(401).json({
        error:
          "Please verify your email before logging in. Check your inbox for OTP.",
        needsOTPVerification: true,
        email: user.email,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Ensure user has unique ID and folder - FORCE assignment
    console.log(
      `🔍 Checking unique ID for user ${user.email}. Current ID: ${
        user.uniqueId || "None"
      }`
    );

    if (!user.uniqueId) {
      try {
        console.log(`🆔 Forcing unique ID assignment for user ${user.email}`);
        const uniqueId = await assignUniqueIdToUser(user._id);
        console.log(
          `✅ Successfully assigned unique ID ${uniqueId} to user ${user.email}`
        );
        user.uniqueId = uniqueId; // Update local user object
      } catch (idError) {
        console.error(
          `❌ Critical error: Failed to assign unique ID during login for ${user.email}:`,
          idError.message
        );
        // Still allow login but log the critical error
      }
    } else {
      console.log(
        `✅ User ${user.email} already has unique ID: ${user.uniqueId}`
      );
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Get fresh user data to ensure uniqueId is included
    const userResponse = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      token,
      user: {
        ...userResponse.toObject(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(400).json({ error: "Verification token required" });

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message:
        "Email verified successfully! You can now login to your account.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const serverUrl = process.env.SERVER_URL;
    const resetUrl = `${serverUrl}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    res.json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and password required",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
        invalidOTP: true,
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmailAfterVerification(user.email, user.firstName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.json({
      success: true,
      message:
        "Email verified successfully! Welcome to Learning Management System.",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailVerificationOTP = otpCode;
    user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send new OTP
    try {
      await sendOTPVerificationEmail(user.email, user.firstName, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    res.json({
      success: true,
      message: "New OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const serverUrl = process.env.SERVER_URL;
    const verificationUrl = `${serverUrl}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, verificationToken, verificationUrl);

    res.json({
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
};


// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "address",
      "bio",
      "learningGoals",
      "interests",
      "skillLevel",
      "preferredLearningStyle"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Multer storage config
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Ensure user has uniqueId (e.g. TT001)
      const uniqueId = await assignUniqueIdToUser(req.user._id);

      // Save in uploads/<uniqueId>/photos
      const uploadDir = path.join(process.cwd(), "uploads", uniqueId, "photos");
      fs.mkdirSync(uploadDir, { recursive: true });

      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

// Multer middleware
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, GIF allowed"));
    }
    cb(null, true);
  },
});

// Upload controller
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Ensure uniqueId for consistency
    const uniqueId = await assignUniqueIdToUser(req.user._id);

    // Paths
    const relativePath = `/uploads/${uniqueId}/photos/${req.file.filename}`;
    const avatarUrl = `${process.env.SERVER_URL}${relativePath}`;

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: relativePath },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      avatar: relativePath,
      avatarUrl, // absolute URL for frontend preview
      user,
    });
  } catch (error) {
    console.error("❌ Upload photo error:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
};


// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Prevent reusing the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from current password" });
    }

    // Save new password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};
