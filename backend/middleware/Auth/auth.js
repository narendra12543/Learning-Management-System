import jwt from "jsonwebtoken";
import User from "../../models/User/User.js";
import { assignUniqueIdToUser } from "../../services/idGeneratorService.js";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecret";

// Middleware to authenticate users
export const authenticate = async (req, res, next) => {
  console.log("🔐 Authentication middleware called");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No authorization header or invalid format");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 Token received:", token ? "Token exists" : "No token");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified, decoded ID:", decoded.id);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      throw new Error("User not found");
    }

    // Block suspended users from accessing protected routes
    if (req.user.accountStatus === "suspended") {
      return res.status(403).json({
        error:
          "Your account has been suspended. Please contact support for assistance.",
        accountSuspended: true,
      });
    }

    // Ensure user has unique ID and folder (synchronous assignment)
    if (!req.user.uniqueId) {
      console.log(
        `🆔 User ${req.user.email} missing unique ID, assigning now...`
      );
      try {
        const uniqueId = await assignUniqueIdToUser(req.user._id);
        console.log(
          `✅ Assigned unique ID ${uniqueId} to user ${req.user.email}`
        );
        // Update the req.user object with the new uniqueId
        req.user.uniqueId = uniqueId;
      } catch (error) {
        console.error(
          `❌ Failed to assign unique ID to ${req.user.email}:`,
          error.message
        );
        // Don't block the request, but log the error
      }
    } else {
      console.log(
        `✅ User ${req.user.email} already has unique ID: ${req.user.uniqueId}`
      );
    }

    // Check if trial has expired and no active subscription
    if (
      req.user.trial &&
      !req.user.trial.isActive &&
      (!req.user.subscription || !req.user.subscription.isActive)
    ) {
      req.trialExpired = true;
    }

    console.log(
      "✅ User found in database:",
      req.user._id,
      "Role:",
      req.user.role,
      "UniqueID:",
      req.user.uniqueId || "Not assigned"
    );
    next();
  } catch (err) {
    console.error("❌ Authentication error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
export const requireAuth = authenticate;

// Middleware to ensure user access
export const requireUser = (req, res, next) => {
  console.log("👤 requireUser middleware called");

  if (!req.user) {
    console.log("❌ Access denied - no user found");
    return res.status(403).json({ error: "User access required" });
  }

  console.log("✅ User access granted");
  next();
};

// Middleware to ensure admin access
export const requireAdmin = (req, res, next) => {
  console.log("👨‍💼 requireAdmin middleware called");

  if (!req.user) {
    console.log("❌ Access denied - no user found");
    return res.status(403).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    console.log("❌ Access denied - user is not admin");
    return res.status(403).json({ error: "Admin access required" });
  }

  console.log("✅ Admin access granted");
  next();
};
