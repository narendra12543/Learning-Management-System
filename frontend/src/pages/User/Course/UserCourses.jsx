import React, { useEffect, useState } from "react";
import { getCoursesApi, enrollInCourseApi } from "../services/Course/CourseService";
import { useAuth } from "../contexts/Auth/AuthContext";
import { CheckCircle, CreditCard, BookOpen, User, Tag, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1234567890";

function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const UserCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCourse, setSuccessCourse] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [showDemoPayment, setShowDemoPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchCourses();
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

  const handlePayAndEnroll = async (course) => {
    if (!user) {
      toast.error("Please login to enroll in courses");
      return;
    }

    // Check if already enrolled
    if (user.enrolledCourses?.includes(course._id)) {
      toast.info("You are already enrolled in this course!");
      return;
    }

    setSelectedCourse(course);
    setShowDemoPayment(true);
  };

  const processDemoPayment = async () => {
    if (!selectedCourse) return;

    setPaymentLoading(selectedCourse._id);

    try {
      // Create order on backend
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/courses/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: (selectedCourse.fees || 100) * 100,
          courseId: selectedCourse._id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.order) {
        toast.error("Failed to create payment order.");
        return;
      }

      // Simulate payment success
      const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/courses/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: "pay_demo_" + Date.now(),
          razorpay_order_id: orderData.order.id,
          razorpay_signature: "demo_signature",
          courseId: selectedCourse._id,
        }),
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        // Update user data to reflect enrollment
        const updatedUser = {
          ...user,
          enrolledCourses: [...(user.enrolledCourses || []), selectedCourse._id]
        };
        updateUser(updatedUser);
        
        setSuccessCourse(selectedCourse);
        setShowSuccess(true);
        setShowDemoPayment(false);
        toast.success("Payment successful! You are enrolled in the course.");
      } else {
        toast.error("Payment verification failed.");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Payment processing failed.");
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Demo Payment Modal */}
      {showDemoPayment && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Demo Payment
            </h2>
            <div className="mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">Course:</span>
                <span className="font-semibold">{selectedCourse.title}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                <span className="font-semibold text-green-600">₹{selectedCourse.fees || 100}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">Payment Method:</span>
                <span className="text-sm text-blue-600">Demo Mode</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is a demo payment. Click "Pay Now" to simulate a successful payment and enroll in the course.
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
              You are now enrolled in <span className="font-semibold">{successCourse?.title}</span>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You can start learning immediately from your dashboard.
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

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and enroll in our comprehensive learning programs
        </p>
        
        {/* Demo Notice */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Demo Payment Mode</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This is a demo environment. Click "Pay & Enroll" to simulate the payment process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto">
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
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Course Thumbnail */}
                {course.thumbnail ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${course.thumbnail}`} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
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
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>Instructor: {course.instructor}</span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{course.fees || 100}
                    </div>
                    <button
                      onClick={() => handlePayAndEnroll(course)}
                      disabled={user?.enrolledCourses?.includes(course._id)}
                      className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        user?.enrolledCourses?.includes(course._id)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                      }`}
                    >
                      {user?.enrolledCourses?.includes(course._id) ? (
                        'Enrolled'
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

export default UserCourses;
