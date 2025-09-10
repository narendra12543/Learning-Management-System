import Coupon from "../../models/Coupon/Coupon.js";
import Course from "../../models/Course/Course.js";
import User from "../../models/User/User.js";
import mongoose from "mongoose";

// Create coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      applicableCourses,
      usageLimit,
      perUserLimit,
      expiryDate,
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    // Validate courses exist
    if (applicableCourses && applicableCourses.length > 0) {
      const courses = await Course.find({ _id: { $in: applicableCourses } });
      if (courses.length !== applicableCourses.length) {
        return res.status(400).json({ error: "Some courses not found" });
      }
    }

    const coupon = new Coupon({
      name,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: discountType === "percentage" ? maxDiscount : null,
      minPurchaseAmount: minPurchaseAmount || 0,
      applicableCourses: applicableCourses || [],
      usageLimit,
      perUserLimit,
      expiryDate: new Date(expiryDate),
      createdBy: req.user._id,
    });

    await coupon.save();
    await coupon.populate("applicableCourses", "title");

    console.log("✅ Coupon created:", coupon.code);
    res.status(201).json({
      success: true,
      coupon,
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating coupon:", error);
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

// Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("applicableCourses", "title category")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error("❌ Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

// Get coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableCourses", "title category fees")
      .populate("createdBy", "firstName lastName");

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("❌ Error fetching coupon:", error);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const updates = { ...req.body };

    // If code is being updated, check uniqueness
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
      const existingCoupon = await Coupon.findOne({
        code: updates.code,
        _id: { $ne: couponId },
      });
      if (existingCoupon) {
        return res.status(400).json({ error: "Coupon code already exists" });
      }
    }

    // Validate courses if being updated
    if (updates.applicableCourses && updates.applicableCourses.length > 0) {
      const courses = await Course.find({
        _id: { $in: updates.applicableCourses },
      });
      if (courses.length !== updates.applicableCourses.length) {
        return res.status(400).json({ error: "Some courses not found" });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(couponId, updates, {
      new: true,
      runValidators: true,
    }).populate("applicableCourses", "title category");

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    console.log("✅ Coupon updated:", coupon.code);
    res.json({
      success: true,
      coupon,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating coupon:", error);
    res.status(500).json({ error: "Failed to update coupon" });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    console.log("✅ Coupon deleted:", coupon.code);
    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting coupon:", error);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

// Get applicable coupons for a course (User)
export const getApplicableCoupons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log("🎫 Fetching coupons for course:", courseId, "user:", userId);

    // Find coupons applicable to this course
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
      $or: [
        { applicableCourses: { $in: [courseId] } },
        { applicableCourses: { $size: 0 } }, // Universal coupons
      ],
    }).populate("applicableCourses", "title category");

    console.log("🎫 Found coupons:", coupons.length);

    // Filter coupons based on usage limits and user limits
    const applicableCoupons = [];

    for (const coupon of coupons) {
      // Check if coupon usage limit is exceeded
      if (coupon.usedCount >= coupon.usageLimit) {
        console.log(
          `🎫 Coupon ${coupon.code} usage limit exceeded: ${coupon.usedCount}/${coupon.usageLimit}`
        );
        continue;
      }

      // Check if user has exceeded per-user limit
      const userUsageCount = coupon.usageHistory.filter(
        (usage) => usage.userId.toString() === userId.toString()
      ).length;

      if (userUsageCount >= coupon.perUserLimit) {
        console.log(
          `🎫 User exceeded limit for coupon ${coupon.code}: ${userUsageCount}/${coupon.perUserLimit}`
        );
        continue;
      }

      // Add to applicable coupons with populated course names
      applicableCoupons.push({
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minPurchaseAmount: coupon.minPurchaseAmount,
        expiryDate: coupon.expiryDate,
        applicableCourses: coupon.applicableCourses, // Include populated course data
        usageLeft: coupon.usageLimit - coupon.usedCount,
        userUsageLeft: coupon.perUserLimit - userUsageCount,
      });
    }

    console.log("🎫 Applicable coupons:", applicableCoupons.length);

    res.json({
      success: true,
      coupons: applicableCoupons,
      count: applicableCoupons.length,
    });
  } catch (error) {
    console.error("❌ Error fetching applicable coupons:", error);
    res.status(500).json({ error: "Failed to fetch applicable coupons" });
  }
};

// Apply coupon and calculate discount
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode, courseId, amount } = req.body;
    const userId = req.user._id;

    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ error: "Invalid or expired coupon" });
    }

    // Check if coupon is applicable to this course
    if (
      coupon.applicableCourses.length > 0 &&
      !coupon.applicableCourses.includes(courseId)
    ) {
      return res
        .status(400)
        .json({ error: "Coupon not applicable to this course" });
    }

    // Check minimum purchase amount
    if (amount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        error: `Minimum purchase amount is ₹${coupon.minPurchaseAmount}`,
      });
    }

    // Check usage limits
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit exceeded" });
    }

    // Check per-user limit
    const userUsageCount = coupon.usageHistory.filter(
      (usage) => usage.userId.toString() === userId.toString()
    ).length;

    if (userUsageCount >= coupon.perUserLimit) {
      return res
        .status(400)
        .json({ error: "You have exceeded the usage limit for this coupon" });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed the amount
    discountAmount = Math.min(discountAmount, amount);
    const finalAmount = amount - discountAmount;

    res.json({
      success: true,
      coupon: {
        name: coupon.name,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      originalAmount: amount,
      discountAmount,
      finalAmount,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("❌ Error applying coupon:", error);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};

// Get coupon analytics (Admin only)
export const getCouponAnalytics = async (req, res) => {
  try {
    const { period = "3months" } = req.query;

    let startDate = new Date();
    switch (period) {
      case "1month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "12months":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 3);
    }

    // Revenue analytics
    const revenueData = await Coupon.aggregate([
      {
        $unwind: "$usageHistory",
      },
      {
        $match: {
          "usageHistory.usedAt": { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$usageHistory.usedAt" },
            month: { $month: "$usageHistory.usedAt" },
          },
          totalDiscount: { $sum: "$usageHistory.discountAmount" },
          totalRevenue: { $sum: "$usageHistory.finalAmount" },
          usageCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Top performing coupons
    const topCoupons = await Coupon.aggregate([
      {
        $addFields: {
          recentUsage: {
            $filter: {
              input: "$usageHistory",
              cond: { $gte: ["$$this.usedAt", startDate] },
            },
          },
        },
      },
      {
        $addFields: {
          recentUsageCount: { $size: "$recentUsage" },
          recentRevenue: { $sum: "$recentUsage.finalAmount" },
          recentDiscount: { $sum: "$recentUsage.discountAmount" },
        },
      },
      {
        $match: {
          recentUsageCount: { $gt: 0 },
        },
      },
      {
        $sort: { recentUsageCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Course-wise coupon usage
    const courseUsage = await Coupon.aggregate([
      {
        $unwind: "$usageHistory",
      },
      {
        $match: {
          "usageHistory.usedAt": { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$usageHistory.courseId",
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: "$usageHistory.discountAmount" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $sort: { usageCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Overall stats for selected period
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({
      isActive: true,
      expiryDate: { $gte: startDate },
    });
    const expiredCoupons = await Coupon.countDocuments({
      expiryDate: { $lt: new Date() },
    });

    // Calculate success rate: total coupons used in period / total active coupons in period
    const totalUsedCoupons = await Coupon.aggregate([
      { $unwind: "$usageHistory" },
      { $match: { "usageHistory.usedAt": { $gte: startDate } } },
      { $group: { _id: "$_id" } },
      { $count: "usedCount" },
    ]);
    const usedCount =
      totalUsedCoupons.length > 0 ? totalUsedCoupons[0].usedCount : 0;
    const conversionRate =
      activeCoupons > 0 ? ((usedCount / activeCoupons) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      analytics: {
        period,
        overview: {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          conversionRate,
        },
        revenueData,
        topCoupons,
        courseUsage,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching coupon analytics:", error);
    res.status(500).json({ error: "Failed to fetch coupon analytics" });
  }
};

// Get available coupons for user (for settings page)
export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🎫 Fetching available coupons for user:", userId);

    // Find active, non-expired coupons with populated course data
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).populate("applicableCourses", "title category fees");

    console.log("🎫 Found total coupons:", coupons.length);
    console.log(
      "🎫 Coupon codes found:",
      coupons.map((c) => c.code)
    );

    // Filter coupons based on usage limits and user limits
    const availableCoupons = [];

    for (const coupon of coupons) {
      console.log(`🎫 Processing coupon: ${coupon.code}`);
      console.log(`   - Usage: ${coupon.usedCount}/${coupon.usageLimit}`);
      console.log(`   - Is Active: ${coupon.isActive}`);
      console.log(`   - Expiry: ${coupon.expiryDate}`);

      // Check if coupon usage limit is exceeded
      if (coupon.usedCount >= coupon.usageLimit) {
        console.log(
          `🎫 Coupon ${coupon.code} usage limit exceeded: ${coupon.usedCount}/${coupon.usageLimit}`
        );
        continue;
      }

      // Check if user has exceeded per-user limit
      const userUsageCount = coupon.usageHistory
        ? coupon.usageHistory.filter(
            (usage) => usage.userId.toString() === userId.toString()
          ).length
        : 0;

      console.log(`   - User usage: ${userUsageCount}/${coupon.perUserLimit}`);

      if (userUsageCount >= coupon.perUserLimit) {
        console.log(
          `🎫 User exceeded limit for coupon ${coupon.code}: ${userUsageCount}/${coupon.perUserLimit}`
        );
        continue;
      }

      // Format course names for display
      const courseNames =
        coupon.applicableCourses && coupon.applicableCourses.length > 0
          ? coupon.applicableCourses.map((course) => course.title)
          : [];

      // Add to available coupons with formatted data
      const couponData = {
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minPurchaseAmount: coupon.minPurchaseAmount,
        expiryDate: coupon.expiryDate,
        applicableCourses: coupon.applicableCourses || [],
        courseNames: courseNames,
        isUniversal: courseNames.length === 0,
        usageLeft: Math.max(0, coupon.usageLimit - coupon.usedCount),
        userUsageLeft: Math.max(0, coupon.perUserLimit - userUsageCount),
      };

      availableCoupons.push(couponData);
      console.log(`✅ Added coupon ${coupon.code} to available list`);
    }

    console.log(
      "🎫 Final available coupons for user:",
      availableCoupons.length
    );
    console.log(
      "🎫 Available coupon codes:",
      availableCoupons.map((c) => c.code)
    );

    res.json({
      success: true,
      coupons: availableCoupons,
      count: availableCoupons.length,
    });
  } catch (error) {
    console.error("❌ Error fetching available coupons:", error);
    res.status(500).json({ error: "Failed to fetch available coupons" });
  }
};
