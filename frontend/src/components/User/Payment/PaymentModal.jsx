import React, { useState, useEffect } from "react";
import { X, Tag, Percent, IndianRupee, Info, BookOpen } from "lucide-react";
import { getApplicableCouponsApi, applyCouponApi } from "../../../services/Coupon/CouponService";
import toast from "react-hot-toast";

const PaymentModal = ({ course, onClose, onPayment }) => {
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [originalAmount] = useState(course.fees || 100);
  const [finalAmount, setFinalAmount] = useState(course.fees || 100);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [course._id]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoading(true);
      console.log("🎫 Fetching coupons for course:", course._id);
      const response = await getApplicableCouponsApi(course._id);
      console.log("🎫 Coupons response:", response.data);
      setAvailableCoupons(response.data.coupons || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast.error("Failed to load available coupons");
      setAvailableCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (coupon) => {
    try {
      setCouponLoading(true);
      const response = await applyCouponApi({
        couponCode: coupon.code,
        courseId: course._id,
        amount: originalAmount
      });

      if (response.data.success) {
        setSelectedCoupon(coupon);
        setDiscountAmount(response.data.discountAmount);
        setFinalAmount(response.data.finalAmount);
        setCouponCode(coupon.code);
        toast.success(`Coupon applied! You saved ₹${response.data.discountAmount}`);
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      toast.error(error.response?.data?.error || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setSelectedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(originalAmount);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handlePayment = () => {
    onPayment({
      originalAmount,
      finalAmount,
      discountAmount,
      couponCode: selectedCoupon?.code || null,
      couponId: selectedCoupon?._id || null
    });
  };

  // Helper function to get proper image URL
  const getImageUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    // Handle different path formats
    if (thumbnailPath.startsWith('http')) {
      return thumbnailPath;
    } else if (thumbnailPath.startsWith('/uploads')) {
      return `${baseUrl}${thumbnailPath}`;
    } else if (thumbnailPath.startsWith('uploads')) {
      return `${baseUrl}/${thumbnailPath}`;
    } else {
      return `${baseUrl}/uploads/${thumbnailPath}`;
    }
  };

  const imageUrl = getImageUrl(course.thumbnail);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Details */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={course.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  console.log("❌ Image failed to load:", imageUrl);
                  // Replace with fallback
                  const fallback = document.createElement('div');
                  fallback.className = 'w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center';
                  fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                  e.target.parentNode.replaceChild(fallback, e.target);
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Category: {course.category}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Instructor: {course.instructor}
              </p>
            </div>
          </div>
        </div>

        {/* Available Coupons */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600" />
            Available Coupons
          </h4>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading coupons...</p>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="text-center py-4">
              <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No coupons available for this course
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCoupon?._id === coupon._id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                  onClick={() => applyCoupon(coupon)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {coupon.code}
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          {coupon.discountType === 'percentage' ? (
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              {coupon.discountValue}% OFF
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />
                              {coupon.discountValue} OFF
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {coupon.description}
                      </p>
                      {coupon.minPurchaseAmount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Min. purchase: ₹{coupon.minPurchaseAmount}
                        </p>
                      )}
                    </div>
                    {couponLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                    ) : selectedCoupon?._id === coupon._id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCoupon();
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    ) : (
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Course Fee:</span>
              <span className="font-medium">₹{originalAmount}</span>
            </div>
            {selectedCoupon && (
              <>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({selectedCoupon.code}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-600" />
              </>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total Amount:</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>

          {selectedCoupon && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p className="font-medium">Coupon Applied Successfully!</p>
                  <p>You saved ₹{discountAmount} with coupon {selectedCoupon.code}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Actions */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold"
          >
            Pay ₹{finalAmount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
