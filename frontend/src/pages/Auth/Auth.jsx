import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  User,
  Phone,
  UserPlus,
  GraduationCap,
  BookOpen,
  Shield,
  Sun,
  Moon,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/Auth/AuthContext";
import { useTheme } from "../../contexts/Theme/ThemeContext";
import ReCAPTCHA from "react-google-recaptcha";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const success = params.get("success");
    const error = params.get("error");
    const message = params.get("message");
    
    if (error) {
      setError(decodeURIComponent(message || "Google authentication failed. Please try again."));
      return;
    }
    
    if (token && success) {
      localStorage.setItem("token", token);
      
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user data');
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            login(null, null, data.user, token);
            navigate("/dashboard", { replace: true });
          } else {
            throw new Error('Invalid user data received');
          }
        })
        .catch((err) => {
          console.error("Google auth error:", err);
          localStorage.removeItem("token");
          setError("Google authentication failed. Please try again.");
        });
    }
  }, [location.search, login, navigate]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    });
    setError("");
    setErrors({});
    setRecaptchaToken("");
    setShowCaptchaError(false);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const onReCAPTCHAChange = (token) => {
    setRecaptchaToken(token);
    setShowCaptchaError(false);
  };

  const validateLoginForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!recaptchaToken) {
      setShowCaptchaError(true);
      return false;
    }
    return true;
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    else if (formData.firstName.trim().length < 2) newErrors.firstName = "First name must be at least 2 characters";

    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (formData.lastName.trim().length < 2) newErrors.lastName = "Last name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be exactly 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.terms) newErrors.terms = "You must accept the terms and conditions";

    if (!recaptchaToken) newErrors.captcha = "Please verify you are human";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!validateLoginForm()) return;
    } else {
      if (!validateSignupForm()) return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, recaptchaToken }
        : { ...formData, recaptchaToken };

      if (isLogin) {
        await login(formData.email, formData.password, recaptchaToken);
        navigate("/dashboard", { replace: true });
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          if (!data.user || !data.token) throw new Error("Invalid response from server");
          await login(null, null, data.user, data.token);
          setRegisteredEmail(data.user.email);
          setShowEmailVerificationModal(true);
        } else {
          setError(data.error || data.message || "Registration failed. Please try again.");
          if (data.recaptchaError && recaptchaRef.current) {
            recaptchaRef.current.reset();
            setRecaptchaToken("");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Authentication failed. Please try again.");
      if (err.response?.data?.recaptchaError && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace("/api/v1", "");
    const redirectUrl = encodeURIComponent(window.location.origin + "/auth");
    window.location.href = `${backendUrl}/api/v1/auth/google?redirect=${redirectUrl}`;
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await response.json();
      setResendMessage(response.ok ? "Verification email sent successfully!" : (data.error || "Failed to send verification email."));
    } catch (err) {
      setResendMessage("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 glass-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {theme === 'light' ? (
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-gray-600 dark:text-gray-300">We've sent a verification link to:</p>
              <p className="text-green-600 dark:text-green-400 font-semibold mt-1">{registeredEmail}</p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p>You must verify your email before you can access your learning dashboard.</p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => { setShowEmailVerificationModal(false); navigate("/dashboard"); }}
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
                <div className={`text-sm p-3 rounded-lg ${resendMessage.includes("successfully") ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
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
            EduLearn LMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            {isLogin ? "Sign in to your learning dashboard" : "Start your learning journey today"}
          </p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Complete Learning Management
            </span>
          </div>
        </div>

        {/* Auth Form Container */}
        <div className="glass-card rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-green-50/30 dark:from-gray-700/50 dark:to-gray-800/30 rounded-3xl"></div>

          {/* Toggle Tabs */}
          <div className="relative z-10 p-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
                {!isLogin && <ArrowLeft className="w-4 h-4 ml-2 opacity-50" />}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                {isLogin && <ArrowRight className="w-4 h-4 mr-2 opacity-50" />}
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="relative z-10 p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Conditional Fields for Signup */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        className={`w-full pl-9 pr-3 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${
                          errors.firstName ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        required={!isLogin}
                      />
                    </div>
                    {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        className={`w-full pl-9 pr-3 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${
                          errors.lastName ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        required={!isLogin}
                      />
                    </div>
                    {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
              )}

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
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Field (Signup only) */}
              {!isLogin && (
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
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.phone ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              )}

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
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    className={`w-full pl-12 pr-14 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
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
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Terms Checkbox (Signup only) */}
              {!isLogin && (
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
                      <button type="button" className="text-green-600 hover:text-green-500 font-semibold hover:underline">
                        Terms & Conditions
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-green-600 hover:text-green-500 font-semibold hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              )}
              {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={onReCAPTCHAChange}
                  onExpired={() => setRecaptchaToken("")}
                  onErrored={() => setRecaptchaToken("")}
                  size="compact"
                />
              </div>
              {(showCaptchaError || errors.captcha) && (
                <p className="text-sm text-red-600 font-medium text-center">
                  Please verify you are human
                </p>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                  <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden group disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isLoading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating Account..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center relative z-10">
                    {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </div>
                )}
              </button>
            </form>

            {/* Google Auth */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full mt-4 flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
