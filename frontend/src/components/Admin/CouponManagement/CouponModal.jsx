import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Calendar, Percent, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { createCouponApi, updateCouponApi } from "../../../services/Coupon/CouponService";

const CouponModal = ({ coupon, courses, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minPurchaseAmount: "",
    applicableCourses: [],
    usageLimit: "",
    perUserLimit: "",
    expiryDate: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        name: coupon.name || "",
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue?.toString() || "",
        maxDiscount: coupon.maxDiscount?.toString() || "",
        minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
        applicableCourses: coupon.applicableCourses?.map(c => c._id) || [],
        usageLimit: coupon.usageLimit?.toString() || "",
        perUserLimit: coupon.perUserLimit?.toString() || "",
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      });
    }
  }, [coupon]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      applicableCourses: prev.applicableCourses.includes(courseId)
        ? prev.applicableCourses.filter(id => id !== courseId)
        : [...prev.applicableCourses, courseId]
    }));
  };

  const generateCouponCode = () => {
    const prefix = formData.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const code = `${prefix}${random}`;
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      const errors = [];
      
      if (!formData.name.trim()) errors.push("Name is required");
      if (!formData.code.trim()) errors.push("Code is required");
      if (!formData.description.trim()) errors.push("Description is required");
      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        errors.push("Discount value must be greater than 0");
      }
      if (formData.discountType === "percentage" && parseFloat(formData.discountValue) > 100) {
        errors.push("Percentage discount cannot exceed 100%");
      }
      if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
        errors.push("Usage limit must be greater than 0");
      }
      if (!formData.perUserLimit || parseInt(formData.perUserLimit) <= 0) {
        errors.push("Per user limit must be greater than 0");
      }
      if (!formData.expiryDate) errors.push("Expiry date is required");
      if (new Date(formData.expiryDate) <= new Date()) {
        errors.push("Expiry date must be in the future");
      }

      if (errors.length > 0) {
        toast.error(errors.join(", "));
        return;
      }

      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
        usageLimit: parseInt(formData.usageLimit),
        perUserLimit: parseInt(formData.perUserLimit),
        code: formData.code.toUpperCase()
      };

      if (coupon) {
        await updateCouponApi(coupon._id, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await createCouponApi(payload);
        toast.success("Coupon created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.error || "Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourses = courses.filter(course => 
    formData.applicableCourses.includes(course._id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {coupon ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coupon Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coupon Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono uppercase"
                    placeholder="e.g., SUMMER50"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCouponCode}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what this coupon offers..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Discount Configuration
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountType: "percentage" }))}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.discountType === "percentage"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountType: "fixed" }))}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.discountType === "fixed"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                    }`}
                  >
                   
                    Fixed Amount
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  step={formData.discountType === "percentage" ? "0.01" : "1"}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder={formData.discountType === "percentage" ? "e.g., 25" : "e.g., 500"}
                  required
                />
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Discount (₹) - Optional
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 1000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Purchase Amount (₹)
                </label>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Usage Limit *
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Per User Limit *
                  </label>
                  <input
                    type="number"
                    name="perUserLimit"
                    value={formData.perUserLimit}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Applicable Courses
              </h3>
              <button
                type="button"
                onClick={() => setShowCourseSelector(!showCourseSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Tag className="w-4 h-4" />
                {showCourseSelector ? "Hide Courses" : "Select Courses"}
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  id="allCourses"
                  name="courseScope"
                  checked={formData.applicableCourses.length === 0}
                  onChange={() => setFormData(prev => ({ ...prev, applicableCourses: [] }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="allCourses" className="text-sm text-gray-700 dark:text-gray-300">
                  Apply to all courses (Universal coupon)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="specificCourses"
                  name="courseScope"
                  checked={formData.applicableCourses.length > 0}
                  onChange={() => {}}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="specificCourses" className="text-sm text-gray-700 dark:text-gray-300">
                  Apply to specific courses only
                </label>
              </div>
            </div>

            {/* Selected Courses Display */}
            {selectedCourses.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Courses ({selectedCourses.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.map(course => (
                    <span
                      key={course._id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                    >
                      {course.title}
                      <button
                        type="button"
                        onClick={() => handleCourseToggle(course._id)}
                        className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Course Selector */}
            {showCourseSelector && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {courses.map(course => (
                    <label
                      key={course._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableCourses.includes(course._id)}
                        onChange={() => handleCourseToggle(course._id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {course.category} • ₹{course.fees || 100}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  {coupon ? "Update Coupon" : "Create Coupon"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;
