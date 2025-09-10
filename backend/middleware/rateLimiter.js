import rateLimit from "express-rate-limit";

// More permissive rate limiter for development
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 100, // 100 requests per 15 minutes in dev, 10 in prod
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`❌ Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
  skip: (req) => {
    // Skip rate limiting for static files and health checks
    return (
      req.path.startsWith("/uploads") ||
      req.path === "/health" ||
      (req.path.startsWith("/api/v1/courses") && req.method === "GET")
    );
  },
});

// Separate rate limiter for course operations (more permissive)
export const courseRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: {
    error: "Too many course requests, please try again later.",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Separate rate limiter for auth operations
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 20, // More permissive in dev
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
