import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createCourse,
  getAllCourses,
  getPublicCourses,
  getCourseById,   
  updateCourse,
  deleteCourse,
  addResource,
  deleteResource,
} from "../../controllers/Course/courseController.js";

import { authenticate, requireAdmin } from "../../middleware/Auth/auth.js";
import User from "../../models/User/User.js";
import Course from "../../models/Course/Course.js";
import Payment from "../../models/Payment.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentDetails,
} from "../../services/razorpayService.js";

const router = express.Router();

// 🔧 Sanitize course title for safe folder names
const sanitizeTitle = (title) => title.replace(/[^a-zA-Z0-9_-]/g, "_");

// ⚡ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const courseTitle = sanitizeTitle(req.body.title || "Untitled");
      const baseDir = path.join("uploads", "Admin-courses", courseTitle);

      let subDir = "others";
      if (file.fieldname === "thumbnail") {
        subDir = "thumbnail";
      } else if (file.fieldname === "resources") {
        subDir = file.mimetype.startsWith("video") ? "videos" : "documents";
      }

      const finalPath = path.join(baseDir, subDir);
      fs.mkdirSync(finalPath, { recursive: true }); // Ensure folder exists

      console.log(`📁 File destination: ${finalPath}`);
      cb(null, finalPath);
    } catch (err) {
      console.error("❌ Error creating directory:", err);
      cb(err, "uploads/");
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    console.log(`📄 File name: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ----------------------
//  Course Routes
// ----------------------

// Public routes → Students (only ACTIVE courses)
router.get("/public", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  console.log(`📚 GET /courses/public - IP: ${req.ip}`);
  next();
}, getPublicCourses);

router.get("/public/:id", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  console.log(`📚 GET /courses/public/:id - IP: ${req.ip}, Course ID: ${req.params.id}`);
  next();
}, getCourseById);

// ----------------------
// Protected routes → Auth required
// ----------------------
router.use(authenticate);

// User enrollment
const enrollInCourse = async (req, res) => {
  try {
    // TODO: Implement course enrollment logic
    res.status(501).json({ error: "Course enrollment not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Error enrolling in course" });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with enrolled courses
    const user = await User.findById(userId).populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: user.enrolledCourses || [],
      count: user.enrolledCourses?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Error fetching enrolled courses" });
  }
};

router.post("/:id/enroll", enrollInCourse);
router.get("/user/enrolled", getEnrolledCourses);

// ----------------------
// Admin-only routes → Can see ALL (active + drafts)
// ----------------------
router.get("/", requireAdmin, getAllCourses);

router.post(
  "/admin",
  requireAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "resources", maxCount: 20 },
  ]),
  createCourse
);

router.put(
  "/admin/:id",
  requireAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "resources", maxCount: 10 },
  ]),
  updateCourse
);

router.delete("/admin/:id", requireAdmin, deleteCourse);

// ----------------------
// Resource Routes
// ----------------------
router.post(
  "/admin/:id/resources",
  requireAdmin,
  upload.array("resources", 20),
  addResource
);

router.delete(
  "/admin/:id/resources/:resourceId",
  requireAdmin,
  deleteResource
);

// ----------------------
// Payment Routes (Razorpay)
// ----------------------
router.post("/payment/create-order", authenticate, async (req, res) => {
  try {
    const { amount, courseId, couponCode, originalAmount, discountAmount } =
      req.body;
    const userId = req.user._id;

    console.log("💳 Creating payment order:", {
      amount,
      courseId,
      userId: userId.toString(),
      couponCode,
      originalAmount,
      discountAmount,
    });

    if (!amount || !courseId) {
      return res.status(400).json({ error: "Amount and course ID are required" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.enrolledCourses?.includes(courseId)) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Coupon handling...
    let couponData = null;
    if (couponCode && originalAmount && discountAmount) {
      try {
        const { default: Coupon } = await import("../../models/Coupon/Coupon.js");
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
          expiryDate: { $gte: new Date() },
        });

        if (coupon) {
          const expectedFinalAmount =
            parseFloat(originalAmount) - parseFloat(discountAmount);
          if (Math.abs(expectedFinalAmount - parseFloat(amount)) > 0.01) {
            return res
              .status(400)
              .json({ error: "Discount calculation mismatch. Please try again." });
          }

          couponData = {
            couponId: coupon._id.toString(),
            couponCode: coupon.code,
            originalAmount: parseFloat(originalAmount),
            discountAmount: parseFloat(discountAmount),
          };
        } else {
          return res.status(400).json({ error: "Invalid or expired coupon" });
        }
      } catch (couponError) {
        console.error("❌ Error validating coupon:", couponError);
        return res.status(500).json({ error: "Error validating coupon" });
      }
    }

    const order = await createRazorpayOrder(
      parseFloat(amount),
      courseId,
      userId,
      couponData
    );

    console.log("✅ Razorpay order created:", order.id);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        courseId,
        courseName: course.title,
        ...(couponData && {
          couponApplied: true,
          originalAmount: couponData.originalAmount,
          discountAmount: couponData.discountAmount,
          couponCode: couponData.couponCode,
        }),
      },
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Verify payment
router.post("/payment/verify", authenticate, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      couponCode,
      originalAmount,
      discountAmount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courseId
    ) {
      return res
        .status(400)
        .json({ error: "Missing required payment verification data" });
    }

    const isValid = verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    if (paymentDetails.status !== "captured") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    let couponId = null;
    if (couponCode && originalAmount && discountAmount) {
      const Coupon = (await import("../../models/Coupon/Coupon.js")).default;
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      });

      if (coupon) {
        coupon.usedCount += 1;
        coupon.usageHistory.push({
          userId: req.user._id,
          courseId,
          discountAmount: parseFloat(discountAmount),
          originalAmount: parseFloat(originalAmount),
          finalAmount:
            parseFloat(originalAmount) - parseFloat(discountAmount),
          usedAt: new Date(),
        });
        await coupon.save();
        couponId = coupon._id;
      }
    }

    const payment = new Payment({
      user: req.user._id,
      course: courseId,
      amount: paymentDetails.amount / 100,
      status: "success",
      transactionId: razorpay_payment_id,
      percentCompleted: 0,
    });

    await payment.save();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    const course = await Course.findById(courseId);

    res.json({
      success: true,
      enrolled: true,
      message: `Successfully enrolled in ${course?.title}`,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentRecord: payment._id,
      ...(couponCode && {
        couponApplied: couponCode,
        savings: discountAmount,
      }),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json({ error: "Payment verification failed. Please contact support." });
  }
});

// Get payment status
router.get("/payment/status/:paymentId", authenticate, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentDetails = await getPaymentDetails(paymentId);

    res.json({
      success: true,
      payment: {
        id: paymentDetails.id,
        status: paymentDetails.status,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        method: paymentDetails.method,
        created_at: paymentDetails.created_at,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

export default router;
