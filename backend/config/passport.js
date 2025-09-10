import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User/User.js";

console.log("🔧 Configuring Passport for LMS...");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Strategy - Profile received:", {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
        });

        const email = profile.emails?.[0]?.value;
        const firstName =
          profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
        const lastName =
          profile.name?.familyName ||
          profile.displayName?.split(" ").slice(1).join(" ") ||
          "";

        if (!email) {
          console.error("❌ No email found in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        // Check if user already exists
        let user = await User.findOne({
          $or: [{ email: email }, { googleId: profile.id }],
        });

        if (user) {
          console.log("🔍 Found existing user:", user.email);

          // Update Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            user.socialMediaLogin = true;
            await user.save();
            console.log("✅ Updated existing user with Google ID");
          }

          return done(null, user);
        } else {
          console.log("🆕 Creating new user from Google profile");

          // Create new user
          user = new User({
            firstName,
            lastName,
            email,
            googleId: profile.id,
            socialMediaLogin: true,
            isEmailVerified: true, // Google emails are pre-verified
            isNewUser: true,
            accountStatus: "active",
            avatar: profile.photos?.[0]?.value || null,
            // Set up trial for new users
            trial: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              isActive: true,
            },
            subscription: {
              plan: "free",
              isActive: false,
            },
          });

          await user.save();
          console.log("✅ New user created from Google:", user.email);

          return done(null, user);
        }
      } catch (error) {
        console.error("❌ Error in Google Strategy for LMS:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (not used in stateless JWT approach, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

console.log("✅ Passport configured successfully for LMS");

export default passport;
