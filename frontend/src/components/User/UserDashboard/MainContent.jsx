import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import { getCoursesApi } from "../../../services/Course/CourseService";
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  Star,
  Flame,
  CreditCard,
  User,
  Tag,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import PaymentModal from "../Payment/PaymentModal";
import PaymentHistory from "../../../pages/User/PaymentHistory";

// Add the missing loadRazorpayScript function
function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const MainContent = () => {
  // Add route-based rendering for Payment History
  const location = window.location.pathname;
  if (
    location === "/payment-history" ||
    location === "/dashboard/payment-history"
  ) {
    return <PaymentHistory />;
  }
  const { user, updateUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCourse, setSuccessCourse] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [showDemoPayment, setShowDemoPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourseForPayment, setSelectedCourseForPayment] =
    useState(null);

  useEffect(() => {
    fetchCourses();
    syncEnrolledCourses();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncEnrolledCourses();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getCoursesApi();
      console.log("📚 Courses fetched:", response.data);
      setCourses(response.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const syncEnrolledCourses = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/courses/user/enrolled`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        const enrolledIds = data.data.map((c) => c._id);
        updateUser({ ...(user || {}), enrolledCourses: enrolledIds });
      }
    } catch (e) {
      // ignore sync errors silently
    }
  };

  const handlePayAndEnroll = (course) => {
    if (!user) {
      toast.error("Please login to enroll in courses");
      return;
    }

    // Check if already enrolled
    if (user.enrolledCourses?.includes(course._id)) {
      toast.info("You are already enrolled in this course!");
      return;
    }

    setSelectedCourseForPayment(course);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    const {
      originalAmount,
      finalAmount,
      discountAmount,
      couponCode,
      couponId,
    } = paymentData;

    setPaymentLoading(selectedCourseForPayment._id);
    setShowPaymentModal(false);

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!res) {
        toast.error("Failed to load Razorpay. Check your connection.");
        setPaymentLoading(null);
        return;
      }

      // Create order on backend with coupon data
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/courses/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: finalAmount,
            courseId: selectedCourseForPayment._id,
            ...(couponCode && {
              couponCode,
              originalAmount,
              discountAmount,
            }),
          }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.order) {
        toast.error(orderData.error || "Failed to create payment order.");
        setPaymentLoading(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RemoteJobs",
        description: `Enrollment for ${selectedCourseForPayment.title}${
          couponCode ? ` (Coupon: ${couponCode})` : ""
        }`,
        image: "/logo.png",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            console.log("✅ Payment successful:", response);

            // Verify payment on backend with coupon data
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/courses/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId: selectedCourseForPayment._id,
                  ...(couponCode && {
                    couponCode,
                    originalAmount,
                    discountAmount,
                  }),
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Update user data to reflect enrollment
              const updatedUser = {
                ...user,
                enrolledCourses: [
                  ...(user.enrolledCourses || []),
                  selectedCourseForPayment._id,
                ],
              };
              updateUser(updatedUser);

              setSuccessCourse(selectedCourseForPayment);
              setShowSuccess(true);

              const savingsMessage = couponCode
                ? ` You saved ₹${discountAmount} with coupon ${couponCode}!`
                : "";
              toast.success(
                `Payment successful! You are enrolled in the course.${savingsMessage}`
              );

              // Refresh courses
              fetchCourses();
            } else {
              toast.error(verifyData.error || "Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          courseId: selectedCourseForPayment._id,
          courseName: selectedCourseForPayment.title,
          userId: user._id,
          ...(couponCode && {
            couponCode,
            originalAmount,
            discountAmount,
            finalAmount,
          }),
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed by user");
            toast.info("Payment cancelled");
            setPaymentLoading(null);
          },
        },
        retry: {
          enabled: true,
          max_count: 1,
        },
        timeout: 300,
        remember_customer: false,
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("❌ Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setPaymentLoading(null);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentLoading(null);
    }
  };

  const processDemoPayment = async () => {
    setPaymentLoading(selectedCourse._id);

    // Simulate payment processing
    setTimeout(() => {
      // Update user data to reflect enrollment
      const updatedUser = {
        ...user,
        enrolledCourses: [...(user.enrolledCourses || []), selectedCourse._id],
      };
      updateUser(updatedUser);

      setSuccessCourse(selectedCourse);
      setShowSuccess(true);
      setShowDemoPayment(false);
      setPaymentLoading(null);

      toast.success("Demo payment successful! You are enrolled in the course.");

      // Refresh courses
      fetchCourses();
    }, 2000);
  };

  // Calculate stats
  const stats = {
    coursesEnrolled: user?.enrolledCourses?.length || 0,
    coursesCompleted: user?.completedCourses?.length || 0,
    totalHours: user?.totalLearningHours || 0,
    learningStreak: user?.learningStreak || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 p-6 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 p-6 transition-colors duration-300">
      {/* Payment Modal with Coupon Support */}
      {showPaymentModal && selectedCourseForPayment && (
        <PaymentModal
          course={selectedCourseForPayment}
          onClose={() => setShowPaymentModal(false)}
          onPayment={handlePaymentSubmit}
        />
      )}

      {/* Demo Payment Modal */}
      {showDemoPayment && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Demo Payment
            </h2>
            <div className="mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Course:
                </span>
                <span className="font-semibold">{selectedCourse.title}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Amount:
                </span>
                <span className="font-semibold text-green-600">
                  ₹{selectedCourse.fees || 100}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Payment Method:
                </span>
                <span className="text-sm text-blue-600">Demo Mode</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is a demo payment. Click "Pay Now" to simulate a successful
                payment and enroll in the course.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoPayment(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processDemoPayment}
                disabled={paymentLoading === selectedCourse._id}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {paymentLoading === selectedCourse._id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are now enrolled in{" "}
              <span className="font-semibold">{successCourse?.title}</span>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You can start learning immediately!
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">👋</div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.firstName || "Student"}!
            </h1>
          </div>
          <p className="text-green-100 mb-4">
            Discover amazing courses and start your learning journey! 🌟
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-300" />
              <span>{stats.learningStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>{stats.coursesCompleted} completed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span>{stats.coursesEnrolled} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-green-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600" />
            Available Courses
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200/50 dark:border-gray-700/50"
              >
                {/* Course Thumbnail */}
                {course.thumbnail ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onLoad={() =>
                      console.log("✅ Image loaded:", course.thumbnail)
                    }
                    onError={(e) => {
                      console.log("❌ Image failed to load:", course.thumbnail);
                      console.log(
                        "❌ Full URL:",
                        `${import.meta.env.VITE_API_URL}${course.thumbnail}`
                      );
                      console.log("❌ Error event:", e);

                      // Replace with fallback immediately
                      const fallbackDiv = document.createElement("div");
                      fallbackDiv.className =
                        "w-full h-48 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center";
                      fallbackDiv.innerHTML = `
                        <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      `;

                      // Replace the image with the fallback
                      e.target.parentNode.replaceChild(fallbackDiv, e.target);
                    }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}

                {/* Course Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          course.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {course.status}
                      </span>
                      <span className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <Tag className="w-4 h-4 mr-1" />
                        {course.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>Instructor: {course.instructor}</span>
                  </div>

                  {/* Resources count */}
                  {course.resources && course.resources.length > 0 && (
                    <div className="flex items-center mb-4 text-sm text-emerald-600 dark:text-emerald-400">
                      <Play className="w-4 h-4 mr-2" />
                      <span>{course.resources.length} learning resources</span>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{course.fees || 100}
                    </div>
                    <button
                      onClick={() => handlePayAndEnroll(course)}
                      disabled={
                        user?.enrolledCourses?.includes(course._id) ||
                        paymentLoading === course._id
                      }
                      className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        user?.enrolledCourses?.includes(course._id)
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 cursor-not-allowed"
                          : paymentLoading === course._id
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg"
                      }`}
                    >
                      {paymentLoading === course._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </>
                      ) : user?.enrolledCourses?.includes(course._id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Enrolled
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay & Enroll
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
