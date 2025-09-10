import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupons,
  applyCoupon,
  getCouponAnalytics,
  getAvailableCoupons,
} from "../../controllers/Coupon/couponController.js";
import { authenticate, requireAdmin } from "../../middleware/Auth/auth.js";

const router = express.Router();

// Admin routes
router.post("/admin", authenticate, requireAdmin, createCoupon);
router.get("/admin", authenticate, requireAdmin, getAllCoupons);
router.get("/admin/analytics", authenticate, requireAdmin, getCouponAnalytics);
router.get("/admin/:id", authenticate, requireAdmin, getCouponById);
router.put("/admin/:id", authenticate, requireAdmin, updateCoupon);
router.delete("/admin/:id", authenticate, requireAdmin, deleteCoupon);

// User routes
router.get("/available", authenticate, getAvailableCoupons);
router.get("/course/:courseId", authenticate, getApplicableCoupons);
router.post("/apply", authenticate, applyCoupon);

export default router;
