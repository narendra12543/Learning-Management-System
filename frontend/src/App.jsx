import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/Theme/ThemeContext";
import { AuthProvider } from "./contexts/Auth/AuthContext";

import Dashboard from "./pages/User/Dashboard/Dashboard";
import LandingPage from "./pages/Landing/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthCallback from "./components/OAuthCallback";

// --- Admin Components ---
import AdminLayout from "./components/Admin/Layout/AdminLayout";
import CourseManagement from "./components/Admin/CourseManagement/CourseManagement";
import CouponManagement from "./components/Admin/CouponManagement/CouponManagement";
import UserManagement from "./components/Admin/UserManagement/UserManagement";

// --- User Settings Component ---
import UserSettings from "./components/User/Settings/UserSettings";

import "./App.css";
import MyCourses from "./pages/User/Course/MyCourses";
import CourseDetails from "./pages/User/Course/CourseDetails";
import About from "./pages/about page/About";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy/RefundPolicy";
import PaymentHistory from "./pages/User/PaymentHistory";
import AdminPaymentManagement from "./components/Admin/PaymentManagement/AdminPaymentManagement";
import Project from "./pages/Landing/Projects";
import Blogs from "./pages/Landing/Blogs";
import Programs from "./pages/Landing/Programs";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Default route → landing page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/projects" element={<Project />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/blogs" element={<Blogs />} />



              <Route path="/about" element={<About />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/refundpolicy" element={<RefundPolicy />} />

              {/* OAuth callback route - This handles Google OAuth redirects */}
              <Route path="/auth" element={<OAuthCallback />} />

              {/* Protected Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected User Courses Page */}
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/course/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />

              {/* Protected User Settings Page */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <UserSettings />
                  </ProtectedRoute>
                }
              />

              {/* Payment History: redirect to dashboard-scoped route for layout */}
              <Route
                path="/payment-history"
                element={<Navigate to="/dashboard/payment-history" replace />}
              />

              {/* Admin layout with nested routes */}

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="courses" element={<CourseManagement />} />
                <Route path="coupons" element={<CouponManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route
                  path="payment-management"
                  element={<AdminPaymentManagement />}
                />
              </Route>

              {/* Dashboard-scoped nested route for Payment History (keeps header/sidebar) */}
              <Route
                path="/dashboard/payment-history"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all → redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgb(31 41 55)",
                  color: "#fff",
                  borderRadius: "12px",
                  border: "1px solid rgb(55 65 81)",
                },
                success: {
                  style: {
                    background: "rgb(34 197 94)",
                  },
                },
                error: {
                  style: {
                    background: "rgb(239 68 68)",
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
