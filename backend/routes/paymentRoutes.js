import express from "express";
import {
  getUserPaymentHistory,
  requestRefund,
  requestDeferral,
  getAllPayments,
  getAllRefundRequests,
  approveRefund,
  rejectRefund,
  getAllDeferralRequests,
  approveDeferral,
  rejectDeferral,
  downloadInvoice,
  adminDirectRefund,
  updatePaymentStatus,
  bulkPaymentActions,
  getPaymentAnalytics,
} from "../controllers/PaymentController.js";
import { requireAuth, requireAdmin } from "../middleware/Auth/auth.js";

const router = express.Router();

// User routes
router.get("/history", requireAuth, getUserPaymentHistory);
router.post("/refund", requireAuth, requestRefund);
router.post("/deferral", requireAuth, requestDeferral);

// Admin routes
router.get("/admin/all", requireAuth, requireAdmin, getAllPayments);
router.get("/admin/refunds", requireAuth, requireAdmin, getAllRefundRequests);
router.post(
  "/admin/refunds/:id/approve",
  requireAuth,
  requireAdmin,
  approveRefund
);
router.post(
  "/admin/refunds/:id/reject",
  requireAuth,
  requireAdmin,
  rejectRefund
);
router.get(
  "/admin/deferrals",
  requireAuth,
  requireAdmin,
  getAllDeferralRequests
);
router.post(
  "/admin/deferrals/:id/approve",
  requireAuth,
  requireAdmin,
  approveDeferral
);
router.post(
  "/admin/deferrals/:id/reject",
  requireAuth,
  requireAdmin,
  rejectDeferral
);

// Invoice download route (for both users and admins)
router.get("/:id/invoice", requireAuth, downloadInvoice);

// Admin advanced controls
router.post(
  "/admin/direct-refund",
  requireAuth,
  requireAdmin,
  adminDirectRefund
);
router.put(
  "/admin/update-status",
  requireAuth,
  requireAdmin,
  updatePaymentStatus
);
router.post(
  "/admin/bulk-actions",
  requireAuth,
  requireAdmin,
  bulkPaymentActions
);
router.get("/admin/analytics", requireAuth, requireAdmin, getPaymentAnalytics);

export default router;
