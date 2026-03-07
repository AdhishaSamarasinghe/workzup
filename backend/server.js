/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

dotenv.config();

const app = express();

// Trust reverse proxy (e.g., Heroku, Render, AWS, Nginx)
app.set("trust proxy", 1);

// Security Hardening
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Chat-branch routes (messages, conversations, users, jobs) ──
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const messagesRoutes = require("./routes/messages");
const conversationsRoutes = require("./routes/conversations");

app.use("/users", usersRoutes);
app.use("/jobs", jobsRoutes);
app.use("/messages", messagesRoutes);
app.use("/conversations", conversationsRoutes);

// ── Main-branch routes (auth, onboarding, recruiter) ──
// Loaded with try/catch so the server works on branches where these don't yet exist.
try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
} catch (_) { /* not yet in this branch */ }

try {
  const onboardingRoutes = require("./routes/onboarding");
  app.use("/api/onboarding", onboardingRoutes);
} catch (_) { /* not yet in this branch */ }

try {
  const recruiterRoutes = require("./routes/recruiter");
  app.use("/api/recruiter", recruiterRoutes);
} catch (_) { /* not yet in this branch */ }

// Health check
app.get("/", (req, res) => {
  res.send("Workzup API is running ✅");
});

// Start the server
const PORT = process.env.PORT || 5000;

app
  .listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
  });
