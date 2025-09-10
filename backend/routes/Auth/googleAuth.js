import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../../config/passport.js";
import { assignUniqueIdToUser } from "../../services/idGeneratorService.js";
import { sendWelcomeEmail } from "../../services/emailService.js";
import User from "../../models/User/User.js";

const googleRouter = express.Router();

googleRouter.get(
  "/google",
  (req, res, next) => {
    console.log("🔐 Google OAuth initiated for LMS");
    console.log("📝 Query params:", req.query);
    console.log("🌐 Origin:", req.get('origin'));
    console.log("🌐 Referer:", req.get('referer'));
    
    // Clear any existing session data that might cause conflicts
    req.session.regenerate((err) => {
      if (err) {
        console.log("Session regeneration error (non-critical):", err);
      }
      
      // Store the client URL for successful redirects
      req.session.oauthRedirect = process.env.CLIENT_URL || "http://localhost:5173";
      
      console.log("🔄 Using OAuth redirect URL:", req.session.oauthRedirect);
      
      passport.authenticate("google", { 
        scope: ["profile", "email"]
      })(req, res, next);
    });
  }
);

googleRouter.get(
  "/google/callback",
  (req, res, next) => {
    console.log("🔄 Google OAuth callback received for LMS");
    console.log("📝 Callback query params:", req.query);
    console.log("🔗 Full callback URL:", req.originalUrl);
    console.log("📦 Session data:", {
      sessionID: req.sessionID,
      oauthRedirect: req.session.oauthRedirect
    });
    next();
  },
  passport.authenticate("google", {
    failureRedirect: false,
  }),
  async (req, res) => {
    try {
      console.log("✅ Google OAuth callback processing for LMS");

      if (!req.user) {
        console.error("❌ No user object found after authentication");
        const clientUrl = req.session.oauthRedirect || process.env.CLIENT_URL || "http://localhost:5173";
        const errorUrl = `${clientUrl}/landing?error=oauth_failed&message=${encodeURIComponent("Authentication failed")}`;
        return res.redirect(errorUrl);
      }

      let user = req.user;
      console.log("🔍 Google OAuth - User object:", {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        accountStatus: user.accountStatus,
        role: user.role
      });

      // Check if account is suspended
      if (user.accountStatus === "suspended") {
        const clientUrl = req.session.oauthRedirect || process.env.CLIENT_URL || "http://localhost:5173";
        const errorUrl = `${clientUrl}/landing?error=account_suspended&message=${encodeURIComponent(
          "Your account has been suspended. Please contact support for assistance."
        )}`;
        return res.redirect(errorUrl);
      }

      // Issue JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        process.env.JWT_SECRET || "yoursecret",
        { expiresIn: "7d" }
      );

      // Get client URL from session or environment
      const clientUrl = req.session.oauthRedirect || process.env.CLIENT_URL || "http://localhost:5173";
      
      // Always redirect to the dashboard after successful OAuth login
      const successUrl = `${clientUrl}/auth?token=${token}&success=true&oauth=google`;
      
      console.log("✅ Google OAuth successful for LMS, redirecting to:", successUrl);

      // Check if the user is new
      const isNewUser = user.isNewUser;

      // If the user is new or doesn't have a uniqueId, assign one
      if (isNewUser || !user.uniqueId) {
        try {
          await assignUniqueIdToUser(user._id);
          console.log(`✅ Assigned unique ID to Google user: ${user.email}`);
        } catch (idError) {
          console.error(`❌ Failed to assign unique ID to Google user ${user.email}: ${idError.message}`);
        }
      }

      // Send welcome email for new users
      if (isNewUser) {
        try {
          await sendWelcomeEmail(user.email, user.firstName);
          console.log(`✅ Welcome email sent to new Google user: ${user.email}`);
        } catch (emailError) {
          console.error("Failed to send welcome email to Google user:", emailError);
        }

        // Mark user as no longer new
        await User.findByIdAndUpdate(user._id, { isNewUser: false });
      }

      // Clear the session data
      req.session.destroy((err) => {
        if (err) {
          console.log("Session destruction error (non-critical):", err);
        }
        res.redirect(successUrl);
      });
    } catch (error) {
      console.error("❌ Error in Google OAuth callback for LMS:", error);
      const clientUrl = req.session.oauthRedirect || process.env.CLIENT_URL || "http://localhost:5173";
      const errorUrl = `${clientUrl}/landing?error=oauth_failed&message=${encodeURIComponent(
        error.message
      )}`;
      res.redirect(errorUrl);
    }
  }
);

// Logout route for session cleanup
googleRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

export default googleRouter;

