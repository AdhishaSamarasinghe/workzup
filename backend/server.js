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

// ── profile-preferences routes ──
try {
  const preferencesRoutes = require("./routes/preferences");
  const recruitersRoutes = require("./routes/recruiters");
  app.use("/preferences", preferencesRoutes);
  app.use("/recruiters", recruitersRoutes);
} catch (_) { }

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

try {
  const applicationsRoutes = require("./routes/applications");
  app.use("/api/applications", applicationsRoutes);
} catch (_) { }

try {
  const adminRoutes = require("./routes/admin");
  app.use("/api/admin", adminRoutes);
} catch (_) { }

let PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => res.json({ ok: true, port: PORT }));
app.get("/", (req, res) => {
  res.send(`Workzup API is running on port ${PORT} ✅`);
});

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    PORT = portToTry;
    console.log(`Backend running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (portToTry === 5000) {
        console.warn(`Port 5000 is in use, falling back to 5001...`);
        startServer(5001);
      } else {
        console.error(
          `Port ${portToTry} is also in use. Could not start server.`,
        );
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(PORT);
