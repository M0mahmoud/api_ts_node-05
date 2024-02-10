import express from "express";
import rateLimit from "express-rate-limit";
import { getClientIp } from "request-ip";

const app = express();
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all routes
app.use(limiter);

// Middleware function to handle incoming requests
const requestHandler = (req, res, next) => {
  // Get IP address using request-ip package
  const clientIP = getClientIp(req);

  // Perform additional checks to prevent spam and excessive requests
  if (!clientIP) {
    return res.status(400).json({ error: "Client IP address not found" });
  }

  // Example: Block requests from a specific IP
  if (clientIP === "blocked_ip_address") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Example: Implement rate limiting for specific IP addresses
  const ipRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    keyGenerator: function (req) {
      // Use client IP as the key for rate limiting
      return clientIP;
    },
    handler: function (req, res, next) {
      // Custom response when rate limit is exceeded
      return res.status(429).json({
        error: "Too many requests from this IP, please try again later",
      });
    },
  });

  // Apply rate limiting only to specific routes or conditions
  // For example, apply rate limiting only to requests to certain routes
  // or based on specific conditions such as user authentication status
  if (req.originalUrl.startsWith("/api")) {
    ipRateLimit(req, res, next);
  } else {
    // Proceed to the next middleware if rate limiting is not applied
    next();
  }
};

// Apply the request handler middleware to all routes
app.use(requestHandler);

// Your existing route
app.use("/", (req, res) => {
  res.json({
    msg: "Server running...",
    ipAddresses: req.header("x-forwarded-for"),
    clientIP: getClientIp(req),
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
