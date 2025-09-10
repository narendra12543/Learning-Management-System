import React, { useState, useEffect } from "react";
import { Ticket, Copy, Clock, Target, Gift, Sparkles, CheckCircle } from "lucide-react";
import { getAvailableCouponsApi, formatCouponApplicability, formatDiscountValue, formatExpiryDate } from "../../../services/Coupon/CouponService";
import toast from "react-hot-toast";

const AvailableCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log("🎫 Frontend: Fetching available coupons...");
      const response = await getAvailableCouponsApi();
      console.log("🎫 Frontend: API response:", response.data);
      console.log("🎫 Frontend: Coupons received:", response.data.coupons?.length || 0);
      
      const couponsData = response.data.coupons || [];
      setCoupons(couponsData);
      
      console.log("🎫 Frontend: Coupons set in state:", couponsData.length);
      console.log("🎫 Frontend: Coupon codes:", couponsData.map(c => c.code));
    } catch (error) {
      console.error("❌ Frontend: Error fetching coupons:", error);
      console.error("❌ Frontend: Error response:", error.response?.data);
      toast.error("Failed to fetch available coupons");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code ${code} copied to clipboard!`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy coupon code");
    }
  };

  const getDiscountBadgeColor = (discountType, discountValue) => {
    if (discountType === "percentage") {
      if (discountValue >= 50) return "bg-gradient-to-r from-red-500 to-pink-500";
      if (discountValue >= 30) return "bg-gradient-to-r from-orange-500 to-yellow-500";
      return "bg-gradient-to-r from-green-500 to-emerald-500";
    }
    return "bg-gradient-to-r from-blue-500 to-indigo-500";
  };

  const isExpiringSoon = (expiryDate) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl h-32"></div>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4">
          <Ticket className="w-16 h-16 mx-auto text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Coupons Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Check back later for new discount offers!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Gift className="w-6 h-6 text-green-600" />
          Available Coupons
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Save money on your course purchases with these exclusive offers! 🎉
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4">
                <Sparkles className="w-8 h-8 text-green-500" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            {/* Expiring soon badge */}
            {isExpiringSoon(coupon.expiryDate) && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                Expiring Soon!
              </div>
            )}

            <div className="p-6 relative z-10">
              {/* Header with discount badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-white font-bold text-sm mb-2 ${getDiscountBadgeColor(coupon.discountType, coupon.discountValue)}`}>
                    {formatDiscountValue(coupon)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {coupon.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {coupon.description}
                  </p>
                </div>
              </div>

              {/* Coupon code section */}
              <div className="mb-4">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-green-600" />
                    <span className="font-mono font-bold text-lg text-gray-800 dark:text-gray-200">
                      {coupon.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Course applicability */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Eligibility:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCouponApplicability(coupon)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatExpiryDate(coupon.expiryDate)}</span>
                </div>
                
                {coupon.minPurchaseAmount > 0 && (
                  <div>
                    <span>Minimum purchase: ₹{coupon.minPurchaseAmount}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span>{coupon.usageLeft} uses left</span>
                  <span>You can use {coupon.userUsageLeft} more times</span>
                </div>
              </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-green-500 opacity-20"></div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 How to use coupons:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Copy the coupon code by clicking the "Copy" button</li>
          <li>• Go to the course you want to purchase</li>
          <li>• Apply the coupon code during checkout</li>
          <li>• Enjoy your discount! 🎉</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailableCoupons;
