import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String },
    uniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: { type: String },

    // Extra Profile Fields (added for ProfileSettings)
    dateOfBirth: { type: Date },
    address: { type: String },
    bio: { type: String },

    // Role-based access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Learning Profile
    learningGoals: [{ type: String }],
    interests: [{ type: String }],
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    preferredLearningStyle: {
      type: String,
      enum: ["visual", "auditory", "kinesthetic", "reading"],
      default: "visual",
    },

    // Progress Tracking
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    certificatesEarned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],
    totalLearningHours: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
    lastLearningDate: { type: Date },
    skillPoints: { type: Number, default: 0 },

    // Auth & System
    password: { type: String, required: false, default: "" },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    // OTP Verification
    emailVerificationOTP: { type: String },
    emailVerificationOTPExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    isNewUser: { type: Boolean, default: true },
    lastActive: { type: Date },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    socialMediaLogin: { type: Boolean, default: false },
    googleId: { type: String },

    // Subscription/Plan
    subscription: {
      isActive: { type: Boolean, default: false },
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      activatedAt: { type: Date },
      expiresAt: { type: Date },
    },

    // Trial
    trial: {
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false },
    },

    // Notification Settings
    notificationSettings: {
      email: {
        courseUpdates: { type: Boolean, default: true },
        assignments: { type: Boolean, default: true },
        certificates: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
      },
      push: {
        instantMessages: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password || this.password === "") {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
