import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  BookOpen,
  Shield,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/Auth/AuthContext";
import { useTheme } from "../contexts/Theme/ThemeContext";
import ReCAPTCHA from "react-google-recaptcha";
import OTPVerification from "../../components/Auth/OTPVerification";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Handle Google OAuth callback for signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const success = params.get("success");
    const error = params.get("error");
    const message = params.get("message");

    if (error) {
      setErrors({
        general: decodeURIComponent(
          message || "Google signup failed. Please try again."
        ),
      });
      // Clear URL parameters and stay on signup page to show error
      window.history.replaceState({}, document.title, "/signup");
      return;
    }

    if (token && success) {
      console.log("🔍 OAuth signup callback detected, processing...");
      localStorage.setItem("token", token);

      fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ User data fetched:", data.user?.email);
          if (data.user) {
            // Fix login function call for Google OAuth
            login(null, null, data.user, token);
            // Clear URL parameters and redirect
            window.history.replaceState({}, document.title, "/signup");
            navigate("/dashboard", { replace: true });
          } else {
            throw new Error("Invalid user data received");
          }
        })
        .catch((err) => {
          console.error("❌ Google signup error:", err);
          localStorage.removeItem("token");
          setErrors({ general: "Google signup failed. Please try again." });
          // Clear URL parameters
          window.history.replaceState({}, document.title, "/signup");
        });
    }
  }, [location.search, login, navigate]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: registeredEmail }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setResendMessage("Verification email sent successfully!");
      } else {
        setResendMessage(data.error || "Failed to send verification email.");
      }
    } catch (err) {
      setResendMessage("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name] || errors.captcha) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "", captcha: "" }));
    }
  };

  const handleRecaptchaChange = (token) => {
    console.log(
      "🔍 reCAPTCHA token received:",
      token ? "Token present" : "No token"
    );
    setRecaptchaToken(token || "");
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const resetRecaptcha = () => {
    setRecaptchaToken("");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Name is required";
    else if (formData.firstName.trim().length < 2)
      newErrors.firstName = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.terms)
      newErrors.terms = "You must accept the terms and conditions";

    if (!recaptchaToken) {
      newErrors.captcha = "Please verify you are human";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            recaptchaToken,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (!data.user || !data.token) {
          throw new Error("Invalid response from server");
        }

        // Check if OTP verification is needed
        if (data.needsOTPVerification) {
          setRegisteredEmail(data.user.email);
          setShowOTPVerification(true);
        } else {
          // Fix login function call for regular signup
          await login(null, null, data.user, data.token);
          setRegisteredEmail(data.user.email);
          setShowEmailVerificationModal(true);
        }
      } else {
        setErrors({
          general:
            data.error ||
            data.message ||
            "Registration failed. Please try again.",
        });
        if (data.recaptchaError) {
          resetRecaptcha();
        }
      }
    } catch (err) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async (user) => {
    try {
      // Login the user after successful OTP verification
      const token = localStorage.getItem("token");
      await login(null, null, user, token);
      setShowOTPVerification(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login after OTP verification failed:", error);
    }
  };

  const handleBackToSignup = () => {
    setShowOTPVerification(false);
    setFormData({
      firstName: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    });
    resetRecaptcha();
  };

  const handleGoogleSignup = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace("/api/v1", "");
    const redirectUrl = encodeURIComponent(window.location.origin + "/signup");
    console.log(
      "🔗 Initiating Google OAuth signup with redirect:",
      redirectUrl
    );
    window.location.href = `${backendUrl}/api/v1/auth/google?redirect=${redirectUrl}`;
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registeredEmail}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onBack={handleBackToSignup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 glass-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </button>

      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a verification link to:
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
                {registeredEmail}
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Please check your email and click the verification link to
                activate your account.
              </p>
              <p>
                You must verify your email before you can access your learning
                dashboard.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setShowEmailVerificationModal(false);
                  navigate("/dashboard");
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                Go to Dashboard
              </button>

              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>

              {resendMessage && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    resendMessage.includes("successfully")
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {resendMessage}
                </div>
              )}

              <button
                onClick={() => setShowEmailVerificationModal(false)}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-green-300 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                <GraduationCap className="w-10 h-10 text-white" />
                <BookOpen className="w-4 h-4 text-white absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-2xl blur-md opacity-30 -z-10"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            Join EduLearn LMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
            Start your learning journey today
          </p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Complete Learning Management
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-green-50/30 dark:from-gray-700/50 dark:to-gray-800/30 rounded-3xl"></div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Name Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-sm hover:shadow-md font-medium text-gray-900 dark:text-white ${
                    errors.firstName
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-sm hover:shadow-md font-medium text-gray-900 dark:text-white ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-sm hover:shadow-md font-medium text-gray-900 dark:text-white ${
                    errors.phone
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={`w-full pl-12 pr-14 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-sm hover:shadow-md font-medium text-gray-900 dark:text-white ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-green-100 dark:border-gray-600">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-500 rounded transition-colors ${
                    errors.terms ? "border-red-300" : ""
                  }`}
                />
                {formData.terms && (
                  <Check className="absolute h-3 w-3 text-white ml-0.5 mt-0.5 pointer-events-none" />
                )}
              </div>
              <div className="text-xs">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-500 font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-500 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-600 font-medium">{errors.terms}</p>
            )}

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                onExpired={() => setRecaptchaToken("")}
                onErrored={() => setRecaptchaToken("")}
                ref={recaptchaRef}
                size="compact"
              />
            </div>
            {errors.captcha && (
              <p className="mt-2 text-sm text-red-600 font-medium text-center">
                {errors.captcha}
              </p>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:via-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center justify-center relative z-10">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center relative z-10">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Google Signup */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded-full">
                  Or sign up with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full mt-4 flex items-center justify-center py-3 px-6 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Have an account?{" "}
              <Link
                to="/auth"
                className="font-bold text-green-600 dark:text-green-400 hover:underline"
              >
                Sign in now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
