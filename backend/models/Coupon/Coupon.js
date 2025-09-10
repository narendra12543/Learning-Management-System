import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null // For percentage discounts
  },
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  applicableCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  perUserLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  usageHistory: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    discountAmount: Number,
    originalAmount: Number,
    finalAmount: Number,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

export default mongoose.model("Coupon", couponSchema);
