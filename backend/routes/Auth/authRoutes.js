import express from "express";
import {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  resendVerificationEmail,
  updateProfile, 
  uploadPhoto,
  upload ,
  changePassword,
} from "../../controllers/User/authController.js";
import { authenticate, requireUser } from "../../middleware/Auth/auth.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";
import { initializeIdCounter } from "../../services/idGeneratorService.js";
import googleRouter from "./googleAuth.js";

const router = express.Router();

// Initialize ID counter system on server start
initializeIdCounter().catch(console.error);

// Apply rate limiting only in production
const conditionalRateLimit =
  process.env.NODE_ENV === "production"
    ? authRateLimiter
    : (req, res, next) => next();

// Public routes with conditional rate limiting
router.post("/register", conditionalRateLimit, register);
router.post("/login", conditionalRateLimit, login);
router.post("/verify-otp", conditionalRateLimit, verifyOTP);
router.post("/resend-otp", conditionalRateLimit, resendOTP);
router.post("/forgot-password", conditionalRateLimit, forgotPassword);
router.post(
  "/resend-verification",
  conditionalRateLimit,
  resendVerificationEmail
);
router.get("/verify-email/:token", verifyEmail);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", authenticate, requireUser, getMe);

// Add this route to get current user info
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        uniqueId: req.user.uniqueId,
        accountStatus: req.user.accountStatus,
        isEmailVerified: req.user.isEmailVerified,
        subscription: req.user.subscription,
        trial: req.user.trial,
      },
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ error: "Failed to get user information" });
  }
});

// Update profile
router.patch("/profile", authenticate, requireUser, updateProfile);

// Upload profile photo
// Use field name "avatar" for consistency
router.post(
  "/upload-photo",
  authenticate,
  requireUser,
  upload.single("avatar"), // multer middleware
  uploadPhoto               // controller saves avatar + updates DB
);

// Change password
router.put("/change-password", authenticate, requireUser, changePassword);

// Google OAuth routes
router.use("/", googleRouter);

export default router;
