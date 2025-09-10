import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Percent,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Ticket,
  Target,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";
import { getCouponsApi, deleteCouponApi } from "../../../services/Coupon/CouponService";
import { getCoursesApi } from "../../../services/Course/CourseService";
import CouponModal from "./CouponModal";

const CouponDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [couponsRes, coursesRes] = await Promise.all([
        getCouponsApi(),
        getCoursesApi()
      ]);
      
      setCoupons(couponsRes.data.coupons || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await deleteCouponApi(couponId);
      toast.success("Coupon deleted successfully");
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === "active") {
      matchesFilter = coupon.isActive && new Date(coupon.expiryDate) > new Date();
    } else if (filterStatus === "expired") {
      matchesFilter = new Date(coupon.expiryDate) <= new Date();
    } else if (filterStatus === "inactive") {
      matchesFilter = !coupon.isActive;
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastCoupon = currentPage * couponsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);
  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);

  const stats = [
    {
      label: "Total Coupons",
      value: coupons.length,
      icon: TrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Coupons",
      value: coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Expired",
      value: coupons.filter(c => new Date(c.expiryDate) <= new Date()).length,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Total Usage",
      value: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      icon: Users,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getStatusBadge = (coupon) => {
    const isExpired = new Date(coupon.expiryDate) <= new Date();
    const isActive = coupon.isActive && !isExpired;
    
    if (isActive) {
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700";
    } else if (isExpired) {
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700";
    } else {
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading coupons...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coupon Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage discount coupons for your courses
              </p>
            </div>
            <button
              onClick={handleCreateCoupon}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Coupon
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search coupons by name or code..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading coupons...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait while we fetch your data</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b-2 border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Coupon Details
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Discount & Usage
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Applicable Courses
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Status & Expiry
                      </th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {currentCoupons.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                              <Ticket className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No coupons found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                              {searchTerm || filterStatus !== "all" 
                                ? "No coupons match your current filters. Try adjusting your search criteria."
                                : "Get started by creating your first coupon to offer discounts to your students."
                              }
                            </p>
                            {!searchTerm && filterStatus === "all" && (
                              <button
                                onClick={handleCreateCoupon}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                              >
                                <Plus size={20} />
                                Create Your First Coupon
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCoupons.map((coupon) => {
                        const isExpired = new Date(coupon.expiryDate) <= new Date();
                        const isActive = coupon.isActive && !isExpired;
                        
                        return (
                          <tr
                            key={coupon._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                          >
                            {/* Coupon Details */}
                            <td className="px-6 py-6">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <Ticket className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                    {coupon.name}
                                  </h3>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-mono mb-2 inline-block">
                                    {coupon.code}
                                  </span>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {coupon.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Discount & Usage */}
                            <td className="px-6 py-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4 text-green-600" />
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {coupon.discountType === "percentage" 
                                      ? `${coupon.discountValue}%`
                                      : `₹${coupon.discountValue}`
                                    }
                                  </span>
                                </div>
                                {coupon.maxDiscount && (
                                  <p className="text-xs text-gray-500">
                                    Max: ₹{coupon.maxDiscount}
                                  </p>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {coupon.usedCount}/{coupon.usageLimit}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Applicable Courses */}
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {coupon.applicableCourses.length === 0 
                                    ? "All courses" 
                                    : `${coupon.applicableCourses.length} course${coupon.applicableCourses.length > 1 ? 's' : ''}`
                                  }
                                </span>
                              </div>
                            </td>

                            {/* Status & Expiry */}
                            <td className="px-6 py-6">
                              <div className="space-y-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(coupon)}`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : isExpired ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                                </span>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                  <div>
                                    <p className="font-medium">{formatDate(coupon.expiryDate)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      {new Date(coupon.expiryDate).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-6">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditCoupon(coupon)}
                                  className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                                  title="Edit Coupon"
                                >
                                  <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(coupon)}
                                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {indexOfFirstCoupon + 1} to{" "}
                      {Math.min(indexOfLastCoupon, filteredCoupons.length)} of{" "}
                      {filteredCoupons.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === index + 1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Coupon Modal */}
        {showModal && (
          <CouponModal
            coupon={editingCoupon}
            courses={courses}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchData();
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Coupon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to delete
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4">
                "{deleteConfirm.name}"?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                This action cannot be undone. All coupon data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCoupon(deleteConfirm._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Delete Coupon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponDashboard;
