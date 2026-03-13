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
  allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/jobs", jobsRoutes);
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

try {
  const employerJobsRoute = require("./routes/employerJobs");
  app.use("/api/employer/my-postings", employerJobsRoute);
} catch (err) {
  console.error("Failed to load employerJobsRoute:", err);
}

let PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => res.json({ ok: true, port: PORT }));
app.get("/", (req, res) => {
  res.send(`Workzup API is running on port ${PORT} ✅`);
});

// --- Legacy Backwards-Compatible Public Endpoints ---
app.get("/jobs", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      where: { status: "ACTIVE" } // Only show active publicly!
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const categories = await prisma.job.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const formatted = categories.map(c => c.category).filter(Boolean);
    res.json(["All Jobs", "All Categories", ...formatted]);
  } catch (err) {
    res.json(["All Jobs", "All Categories", "Hospitality", "Retail"]);
  }
});

app.get("/max-pay", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const aggregation = await prisma.job.aggregate({
      _max: { pay: true }
    });
    res.json({ max: aggregation._max.pay || 5000 });
  } catch (err) {
    res.json({ max: 5000 });
  }
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
