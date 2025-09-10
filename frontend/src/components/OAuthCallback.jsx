import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/Auth/AuthContext";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("processing");
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get("token");
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const message = searchParams.get("message");
        const oauth = searchParams.get("oauth");

        console.log("🔄 OAuth Callback received:", {
          token: token ? "Present" : "Missing",
          success,
          error,
          oauth,
          message
        });

        if (error) {
          console.error("❌ OAuth Error:", error, message);
          setStatus("error");
          
          if (error === "account_suspended") {
            toast.error("Your account has been suspended. Please contact support.");
          } else if (error === "oauth_failed") {
            toast.error(message || "Authentication failed. Please try again.");
          } else {
            toast.error(message || "An error occurred during authentication.");
          }
          
          setTimeout(() => {
            navigate("/landing", { replace: true });
          }, 3000);
          return;
        }

        if (success === "true" && token) {
          console.log("✅ OAuth Success - Token received");
          setStatus("success");

          // Store the token
          localStorage.setItem("token", token);
          
          // Fetch user data with the token
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log("✅ User data fetched:", userData.user);

            // Use the login function to set user and token in context
            await login(null, null, userData.user, token);

            // Show success message only once
            toast.success(`Welcome back, ${userData.user.firstName}! 🎉`, {
              id: 'oauth-success' // Prevent duplicate toasts
            });

            // Redirect based on user role
            setTimeout(() => {
              if (userData.user.role === "admin") {
                navigate("/admin/courses", { replace: true });
              } else {
                navigate("/dashboard", { replace: true });
              }
            }, 1500);
          } else {
            throw new Error("Failed to fetch user data");
          }
        } else {
          console.error("❌ OAuth callback missing required parameters");
          setStatus("error");
          toast.error("Authentication failed. Missing required data.");
          
          setTimeout(() => {
            navigate("/landing", { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error("❌ OAuth callback error:", error);
        setStatus("error");
        toast.error("Authentication failed. Please try again.");
        
        setTimeout(() => {
          navigate("/landing", { replace: true });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Completing Sign In...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we finish setting up your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign In Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign In Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was an issue with your authentication. Redirecting you back...
            </p>
            <button
              onClick={() => navigate("/landing", { replace: true })}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
