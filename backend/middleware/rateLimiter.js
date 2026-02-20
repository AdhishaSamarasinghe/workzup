const rateLimit = require("express-rate-limit");

// General global rate limit (Prevents basic volumetric DDoS on non-specific routes)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { error: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for authentication (Login/Register/Refresh)
// Prevents credential stuffing / brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register requests per 15 mins
    message: { error: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for applying to jobs
// Prevents spam bots from mass applying
const applyJobLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit to 20 applications per hour per IP
    message: { error: "You have reached the maximum number of applications allowed per hour." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for job creation
// Prevents spam job postings
const createJobLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // Limit 15 job posts per hour
    message: { error: "You are posting jobs too quickly. Please wait before creating more." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    applyJobLimiter,
    createJobLimiter
};
