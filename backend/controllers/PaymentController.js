import Payment from "../models/Payment.js";
import RefundRequest from "../models/RefundRequest.js";
import DeferralRequest from "../models/DeferralRequest.js";
import Course from "../models/Course/Course.js";
import User from "../models/User/User.js";

// Get payment history for logged-in user
export const getUserPaymentHistory = async (req, res) => {
  try {
    // Normalize across schemas and include course details
    const payments = await Payment.aggregate([
      {
        $match: {
          $or: [{ user: req.user._id }, { userId: req.user._id }],
        },
      },
      {
        $addFields: {
          courseRef: { $ifNull: ["$course", "$courseId"] },
          statusNorm: {
            $cond: [
              {
                $in: ["$status", ["success", "refunded", "failed", "deferred"]],
              },
              "$status",
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$status", "captured"] }, then: "success" },
                    {
                      case: { $eq: ["$status", "authorized"] },
                      then: "success",
                    },
                    { case: { $eq: ["$status", "created"] }, then: "success" },
                  ],
                  default: "success",
                },
              },
            ],
          },
          transactionIdNorm: {
            $ifNull: ["$transactionId", "$razorpayPaymentId"],
          },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseRef",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: { path: "$courseDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          status: "$statusNorm",
          transactionId: "$transactionIdNorm",
          percentCompleted: { $ifNull: ["$percentCompleted", 0] },
          course: {
            _id: "$courseDoc._id",
            title: { $ifNull: ["$courseDoc.title", "$courseDoc.name"] },
            name: { $ifNull: ["$courseDoc.name", "$courseDoc.title"] },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(payments);
  } catch (err) {
    console.error("getUserPaymentHistory error:", err);
    res.status(500).json({ error: "Failed to fetch payment history." });
  }
};

// Request a refund
export const requestRefund = async (req, res) => {
  const { paymentId, reason } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }
    // Check eligibility: within 7 days, <20% completed
    const daysSincePayment =
      (Date.now() - payment.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSincePayment > 7 || payment.percentCompleted > 20) {
      return res.status(400).json({ error: "Refund not eligible." });
    }
    const refund = new RefundRequest({
      user: req.user._id,
      payment: payment._id,
      reason,
    });
    await refund.save();
    res.json({ message: "Refund request submitted.", refund });
  } catch (err) {
    res.status(500).json({ error: "Failed to request refund." });
  }
};

// Request a deferral
export const requestDeferral = async (req, res) => {
  const { courseId, batch, reason } = req.body;
  try {
    // Find payment for this course
    const payment = await Payment.findOne({
      user: req.user._id,
      course: courseId,
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }
    // Check eligibility: within 20% completed
    if (payment.percentCompleted > 20) {
      return res.status(400).json({ error: "Deferral not eligible." });
    }
    const deferral = new DeferralRequest({
      user: req.user._id,
      course: courseId,
      batch,
      reason,
    });
    await deferral.save();
    res.json({ message: "Deferral request submitted.", deferral });
  } catch (err) {
    res.status(500).json({ error: "Failed to request deferral." });
  }
};

// Admin: Get all payments
export const getAllPayments = async (req, res) => {
  try {
    // Support both schemas: { user, course } and legacy { userId, courseId }
    const payments = await Payment.aggregate([
      // Create unified refs
      {
        $addFields: {
          userRef: { $ifNull: ["$user", "$userId"] },
          courseRef: { $ifNull: ["$course", "$courseId"] },
          statusNorm: {
            $cond: [
              {
                $in: ["$status", ["success", "refunded", "failed", "deferred"]],
              },
              "$status",
              // Map Razorpay statuses to app statuses; default to captured->success
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$status", "captured"] }, then: "success" },
                    {
                      case: { $eq: ["$status", "authorized"] },
                      then: "success",
                    },
                    { case: { $eq: ["$status", "created"] }, then: "success" },
                  ],
                  default: "success",
                },
              },
            ],
          },
          transactionIdNorm: {
            $ifNull: ["$transactionId", "$razorpayPaymentId"],
          },
        },
      },
      // Lookups
      {
        $lookup: {
          from: "users",
          localField: "userRef",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "courses",
          localField: "courseRef",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: { path: "$courseDoc", preserveNullAndEmptyArrays: true } },
      // Shape response
      {
        $project: {
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          status: "$statusNorm",
          transactionId: "$transactionIdNorm",
          percentCompleted: { $ifNull: ["$percentCompleted", 0] },
          // Minimal user and course objects for UI
          user: {
            _id: "$userDoc._id",
            firstName: "$userDoc.firstName",
            lastName: "$userDoc.lastName",
            email: "$userDoc.email",
          },
          course: {
            _id: "$courseDoc._id",
            title: { $ifNull: ["$courseDoc.title", "$courseDoc.name"] },
            name: { $ifNull: ["$courseDoc.name", "$courseDoc.title"] },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(payments);
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
};

// Admin: Get all refund requests
export const getAllRefundRequests = async (req, res) => {
  try {
    const refunds = await RefundRequest.find()
      .populate("user", "firstName lastName email")
      .populate("payment")
      .sort({ requestedAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch refund requests." });
  }
};

// Admin: Approve refund
export const approveRefund = async (req, res) => {
  try {
    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ error: "Refund request not found." });
    }
    refund.status = "approved";
    refund.processedAt = Date.now();
    if (req.body?.adminReason) refund.adminReason = req.body.adminReason;
    if (req.user?._id) refund.processedBy = req.user._id;
    await refund.save();
    // Mark payment as refunded
    const payment = await Payment.findByIdAndUpdate(
      refund.payment,
      { status: "refunded" },
      { new: true }
    );

    // De-enroll the user from the course for this payment (support legacy fields)
    if (payment) {
      const userId = payment.user || payment.userId;
      const courseId = payment.course || payment.courseId;
      if (userId && courseId) {
        try {
          await User.findByIdAndUpdate(userId, {
            $pull: { enrolledCourses: courseId },
          });
        } catch (unenrollErr) {
          console.error("Failed to de-enroll user after refund:", unenrollErr);
        }
      }
    }
    res.json({ message: "Refund approved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve refund." });
  }
};

// Admin: Reject refund
export const rejectRefund = async (req, res) => {
  try {
    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ error: "Refund request not found." });
    }
    refund.status = "rejected";
    refund.processedAt = Date.now();
    if (req.body?.adminReason) refund.adminReason = req.body.adminReason;
    if (req.user?._id) refund.processedBy = req.user._id;
    await refund.save();
    res.json({ message: "Refund rejected." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject refund." });
  }
};

// Admin: Get all deferral requests
export const getAllDeferralRequests = async (req, res) => {
  try {
    const deferrals = await DeferralRequest.find()
      .populate("user", "firstName lastName email")
      .populate("course", "name")
      .sort({ requestedAt: -1 });
    res.json(deferrals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deferral requests." });
  }
};

// Admin: Approve deferral
export const approveDeferral = async (req, res) => {
  try {
    const deferral = await DeferralRequest.findById(req.params.id);
    if (!deferral) {
      return res.status(404).json({ error: "Deferral request not found." });
    }
    deferral.status = "approved";
    if (!deferral) {
      return res.status(404).json({ error: "Deferral request not found." });
    }
    // Optionally update payment status
    await Payment.findOneAndUpdate(
      { user: deferral.user, course: deferral.course },
      { status: "deferred" }
    );
    res.json({ message: "Deferral approved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve deferral." });
  }
};

// Admin: Reject deferral
export const rejectDeferral = async (req, res) => {
  try {
    const deferral = await DeferralRequest.findById(req.params.id);
    if (!deferral) {
      return res.status(404).json({ error: "Deferral request not found." });
    }
    deferral.status = "rejected";
    deferral.processedAt = Date.now();
    await deferral.save();
    res.json({ message: "Deferral rejected." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject deferral." });
  }
};

// Download invoice for a payment
export const downloadInvoice = async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("course", "title name");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // Attach legacy fields if needed
    if (!payment.course && payment.courseId) {
      const legacyCourse = await Course.findById(payment.courseId).select(
        "title name"
      );
      if (legacyCourse) {
        payment = payment.toObject();
        payment.course = legacyCourse;
      }
    }

    if (!payment.user && payment.userId) {
      const legacyUser = await User.findById(payment.userId).select(
        "firstName lastName email"
      );
      if (legacyUser) {
        payment = payment.toObject();
        payment.user = legacyUser;
      }
    }

    // Access check
    if (
      req.user.role !== "admin" &&
      payment.user?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Generate PDF
    const { default: PDFDocument } = await import("pdfkit");
    const path = await import("path");
    const fs = await import("fs");

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      info: {
        Title: "Invoice",
        Author: "RemoteJobs",
        Subject: "Course Payment Invoice",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${
        payment.transactionId || payment.razorpayPaymentId
      }.pdf`
    );

    doc.pipe(res);

    // ===== PROFESSIONAL HEADER =====
    const logoPath = path.join(
      process.cwd(),
      "frontend",
      "public",
      "assets",
      "logo.png"
    );

    // Add logo if it exists
    try {
      console.log("Looking for logo at:", logoPath);
      console.log("Logo exists:", fs.existsSync(logoPath));

      if (fs.existsSync(logoPath)) {
        console.log("Adding logo to PDF");
        doc.image(logoPath, 50, 40, { width: 100, height: 75 });
      } else {
        console.log("Logo file not found at specified path");
      }
    } catch (logoError) {
      console.log("Error loading logo:", logoError.message);
    }

    // Company branding section
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#2D3748")
      .text("RemoteJobs", 170, 50);

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#4A5568")
      .text("Learning Management System", 170, 80);

    // Contact information
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#718096")
      // .text("123, Tech Street, Electronic City", 170, 100)
      // .text("Bengaluru, Karnataka 560100, India", 170, 115)
      .text(" mernprogram@ecerasystem.com | +1 2486771972", 170, 130)
      .text("www.rmtjob.com", 170, 145);

    // ===== INVOICE DETAILS (RIGHT SIDE) =====
    const invoiceBoxY = 50;
    const invoiceBoxWidth = 200;
    const invoiceBoxX = 400;

    // Invoice box background
    doc
      .rect(invoiceBoxX, invoiceBoxY, invoiceBoxWidth, 80)
      .fillColor("#F7FAFC")
      .fill()
      .strokeColor("#E2E8F0")
      .stroke();

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#2D3748")
      .text("INVOICE", invoiceBoxX + 10, invoiceBoxY + 15);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#4A5568")
      .text(
        `#${payment.transactionId || payment.razorpayPaymentId}`,
        invoiceBoxX + 10,
        invoiceBoxY + 35
      )
      .text(
        `Date: ${new Date(payment.createdAt).toLocaleDateString()}`,
        invoiceBoxX + 10,
        invoiceBoxY + 50
      )
      .text(
        `Status: ${payment.status.toUpperCase()}`,
        invoiceBoxX + 10,
        invoiceBoxY + 65
      );

    // ===== CUSTOMER INFO SECTION =====
    const customerY = 180;
    const customerName = `${payment.user?.firstName || ""} ${
      payment.user?.lastName || ""
    }`.trim();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#2D3748")
      .text("Bill To:", 50, customerY);

    // Customer info box
    doc
      .rect(50, customerY + 20, 300, 60)
      .fillColor("#F8FAFC")
      .fill()
      .strokeColor("#E2E8F0")
      .stroke();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1A202C")
      .text(customerName || "N/A", 60, customerY + 35);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#4A5568")
      .text(payment.user?.email || "N/A", 60, customerY + 50)
      .text("Customer", 60, customerY + 65);

    // ===== COURSE DETAILS TABLE =====
    const courseName =
      payment.course?.title || payment.course?.name || "Course";
    const tableTop = 280;
    const tableWidth = 500;
    const itemX = 50;
    const descX = 100;
    const qtyX = 350;
    const priceX = 400;
    const totalX = 500;

    // Table header with background
    doc.rect(itemX, tableTop, tableWidth, 25).fillColor("#2D3748").fill();

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Item", itemX + 5, tableTop + 8)
      .text("Description", descX + 5, tableTop + 8)
      .text("Qty", qtyX + 5, tableTop + 8)
      .text("Price", priceX + 5, tableTop + 8)
      .text("Total", totalX + 5, tableTop + 8);

    // Table row
    const rowHeight = 30;
    doc
      .rect(itemX, tableTop + 25, tableWidth, rowHeight)
      .fillColor("#FFFFFF")
      .fill()
      .strokeColor("#E2E8F0")
      .stroke();

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#1A202C")
      .text("1", itemX + 5, tableTop + 40)
      .text(courseName, descX + 5, tableTop + 40)
      .text("1", qtyX + 5, tableTop + 40)
      .text(`₹${payment.amount.toFixed(2)}`, priceX + 5, tableTop + 40)
      .text(`₹${payment.amount.toFixed(2)}`, totalX + 5, tableTop + 40);

    // Total section
    const totalY = tableTop + 25 + rowHeight + 20;
    doc
      .rect(350, totalY, 200, 40)
      .fillColor("#F7FAFC")
      .fill()
      .strokeColor("#E2E8F0")
      .stroke();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#2D3748")
      .text("Total Amount:", 360, totalY + 10)
      .text(`₹${payment.amount.toFixed(2)}`, 500, totalY + 10, {
        align: "right",
      });

    // Payment method
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#718096")
      .text("Payment Method: Razorpay", 360, totalY + 25);

    // ===== PROFESSIONAL FOOTER =====
    const footerY = 450;

    // Footer line
    doc
      .moveTo(50, footerY)
      .lineTo(550, footerY)
      .strokeColor("#E2E8F0")
      .stroke();

    // Thank you message
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#2D3748")
      .text("Thank you for choosing RemoteJobs!", 50, footerY + 20, {
        align: "center",
      });

    // Terms and conditions
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#718096")
      .text(
        "This is a system-generated invoice and does not require a signature.",
        50,
        footerY + 45,
        { align: "center" }
      )
      .text(
        "For any queries, contact us at  mernprogram@ecerasystem.com | +1 2486771972",
        50,
        footerY + 60,
        { align: "center" }
      )
      .text("© 2025 RemoteJobs. All rights reserved.", 50, footerY + 80, {
        align: "center",
      });

    // Add decorative elements
    doc
      .circle(100, footerY + 100, 2)
      .fillColor("#4299E1")
      .fill();

    doc
      .circle(200, footerY + 100, 2)
      .fillColor("#4299E1")
      .fill();

    doc
      .circle(300, footerY + 100, 2)
      .fillColor("#4299E1")
      .fill();

    doc.end();
  } catch (err) {
    console.error("downloadInvoice error:", err);
    res.status(500).json({ error: "Failed to generate invoice." });
  }
};

// Admin: Direct refund without user request
export const adminDirectRefund = async (req, res) => {
  try {
    const { paymentId, reason, amount } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // Create refund request directly
    const refund = new RefundRequest({
      user: payment.user || payment.userId,
      payment: paymentId,
      reason: reason || "Admin initiated refund",
      status: "approved",
      adminReason: "Admin direct refund",
      processedAt: Date.now(),
      processedBy: req.user._id,
    });
    await refund.save();

    // Update payment status
    payment.status = "refunded";
    await payment.save();

    // De-enroll user from course
    const userId = payment.user || payment.userId;
    const courseId = payment.course || payment.courseId;
    if (userId && courseId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $pull: { enrolledCourses: courseId },
        });
      } catch (unenrollErr) {
        console.error(
          "Failed to de-enroll user after admin refund:",
          unenrollErr
        );
      }
    }

    res.json({ message: "Payment refunded successfully.", refund });
  } catch (err) {
    console.error("adminDirectRefund error:", err);
    res.status(500).json({ error: "Failed to process refund." });
  }
};

// Admin: Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status, reason } = req.body;
    const validStatuses = ["success", "failed", "refunded", "deferred"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status,
        updatedAt: Date.now(),
        ...(reason && { adminNote: reason }),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    res.json({ message: "Payment status updated.", payment });
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    res.status(500).json({ error: "Failed to update payment status." });
  }
};

// Admin: Bulk actions
export const bulkPaymentActions = async (req, res) => {
  try {
    const { paymentIds, action, reason } = req.body;

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ error: "Payment IDs required." });
    }

    let result = { updated: 0, failed: 0, errors: [] };

    for (const paymentId of paymentIds) {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          result.failed++;
          result.errors.push(`Payment ${paymentId} not found`);
          continue;
        }

        switch (action) {
          case "refund":
            payment.status = "refunded";
            // De-enroll user
            const userId = payment.user || payment.userId;
            const courseId = payment.course || payment.courseId;
            if (userId && courseId) {
              await User.findByIdAndUpdate(userId, {
                $pull: { enrolledCourses: courseId },
              });
            }
            break;
          case "mark_failed":
            payment.status = "failed";
            break;
          case "mark_success":
            payment.status = "success";
            break;
          default:
            result.failed++;
            result.errors.push(`Invalid action: ${action}`);
            continue;
        }

        payment.updatedAt = Date.now();
        if (reason) payment.adminNote = reason;
        await payment.save();
        result.updated++;
      } catch (err) {
        result.failed++;
        result.errors.push(`Payment ${paymentId}: ${err.message}`);
      }
    }

    res.json({ message: "Bulk action completed.", result });
  } catch (err) {
    console.error("bulkPaymentActions error:", err);
    res.status(500).json({ error: "Failed to process bulk actions." });
  }
};

// Admin: Get payment analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    let days = 30;
    if (period === "7d") days = 7;
    if (period === "90d") days = 90;
    if (period === "1y") days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] },
          },
          totalPayments: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          refundedCount: {
            $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          avgOrderValue: {
            $avg: { $cond: [{ $eq: ["$status", "success"] }, "$amount", null] },
          },
        },
      },
    ]);

    res.json(
      analytics[0] || {
        totalRevenue: 0,
        totalPayments: 0,
        successCount: 0,
        refundedCount: 0,
        failedCount: 0,
        avgOrderValue: 0,
      }
    );
  } catch (err) {
    console.error("getPaymentAnalytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};
