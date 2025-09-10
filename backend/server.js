import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";
import fs from "fs";

// Import routes
import authRoutes from "./routes/Auth/authRoutes.js";
import googleAuthRoutes from "./routes/Auth/googleAuth.js";
import uploadRoutes from "./routes/Upload/uploadRoutes.js";
import courseRoutes from "./routes/Course/courseRoutes.js";
import couponRoutes from "./routes/Coupon/couponRoutes.js";
import adminRoutes from "./routes/Admin/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Import services
import { initializeIdCounter } from "./services/idGeneratorService.js";

// Import passport configuration
import "./config/passport.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

// Check Razorpay configuration (warn if missing)
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️ Razorpay configuration missing. Payment features will not work."
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Session configuration for Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://www.google.com"],
        frameSrc: ["'self'", "https://www.google.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting - More permissive configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 500, // Much higher limit for development
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static files, health checks, and course browsing
    return (
      req.path.startsWith("/uploads") ||
      req.path === "/health" ||
      (req.path.startsWith("/api/v1/courses") && req.method === "GET")
    );
  },
});

// Only apply rate limiting to auth routes in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/v1/auth", limiter);
} else {
  console.log("🔧 Rate limiting disabled for development");
}

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://rmtjob.com",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced static file serving with proper CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    console.log(`📸 Static file requested: ${req.path}`);

    // Set CORS headers for static files
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !origin) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    // Set cache headers for images
    if (req.path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      res.header("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
      res.header("Content-Type", "image/" + path.extname(req.path).slice(1));
    }

    // Log file access attempts
    const filePath = path.join(__dirname, "uploads", req.path);
    console.log(`📁 Full file path: ${filePath}`);
    console.log(`📁 Request origin: ${origin}`);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.log("✅ File exists");
    } else {
      console.log("❌ File not found");
      return res.status(404).json({ error: "File not found" });
    }

    next();
  },
  express.static(path.join(__dirname, "uploads"), {
    // Additional static file options
    setHeaders: (res, path) => {
      // Set proper content type for images
      if (path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        const ext = path.split(".").pop().toLowerCase();
        if (ext === "svg") {
          res.setHeader("Content-Type", "image/svg+xml");
        } else if (ext === "jpg" || ext === "jpeg") {
          res.setHeader("Content-Type", "image/jpeg");
        } else {
          res.setHeader("Content-Type", `image/${ext}`);
        }
      }

      // Add CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RemoteJobs LMS API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
// ...existing code...
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", googleAuthRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Email verification page
app.get("/verify-email/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "email-verification.html"));
});

// Password reset page
app.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "password-reset.html"));
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate field value",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize ID counter
    await initializeIdCounter();
    console.log("✅ ID counter initialized");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 RemoteJobs LMS Server running in http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/v1/auth/google`);

    if (process.env.CLIENT_URL) {
      console.log(`🎨 Client URL: ${process.env.CLIENT_URL}`);
    }
  });
};

// Initialize database and start server
connectDB().then(startServer);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

export default app;
