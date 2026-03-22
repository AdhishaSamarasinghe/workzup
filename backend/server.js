/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const { loadEnv, getEnv, validateRequiredEnv } = require("./config/env");

loadEnv();

try {
  const envReport = validateRequiredEnv();
  if (envReport.missingWarnings.length > 0) {
    console.warn(
      `Environment warning: missing optional production variables: ${envReport.missingWarnings.join(", ")}.`,
    );
  }
} catch (error) {
  console.error("Environment configuration error:", error.message);
  process.exit(1);
}

const frontendUrl = getEnv("FRONTEND_URL", "http://localhost:3000");

const { initSocket } = require("./socket");

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

app.set("trust proxy", 1);
app.use(helmet());

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "30mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("SERVER FILE RUNNING:", __filename);

// IMPORTANT: explicitly load admin folder index.js
const adminRoutes = require("./routes/admin/index");
console.log(
  "ADMIN ROUTES RESOLVED TO:",
  require.resolve("./routes/admin/index")
);
app.use("/api/admin", adminRoutes);

// Optional / branch routes
try {
  const preferencesRoutes = require("./routes/preferences");
  const recruitersRoutes = require("./routes/recruiters");
  app.use("/preferences", preferencesRoutes);
  app.use("/recruiters", recruitersRoutes);
} catch (_) {}

try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
} catch (_) {}

try {
  const recruiterRoutes = require("./routes/recruiter");
  app.use("/api/recruiter", recruiterRoutes);
} catch (_) {}

try {
  const applicationsRoutes = require("./routes/applications");
  app.use("/api/applications", applicationsRoutes);
} catch (_) {}

try {
  const messagingRoutes = require("./routes/messaging");
  app.use("/api/messaging", messagingRoutes);
} catch (err) {
  console.error("Failed to load messaging routes:", err);
}

try {
  const savedJobsRoutes = require("./routes/savedJobs");
  app.use("/api/saved-jobs", savedJobsRoutes);
} catch (_) {}

try {
  const payHereRoutes = require("./routes/payhere");
  app.use("/api/payhere", payHereRoutes);
} catch (err) {
  console.error("Failed to load payhere routes:", err);
}

try {
  const employerJobsRoute = require("./routes/employerJobs");
  app.use("/api/employer/my-postings", employerJobsRoute);
} catch (err) {
  console.error("Failed to load employerJobsRoute:", err);
}

// Main app routes
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const messagesRoutes = require("./routes/messages");
const conversationsRoutes = require("./routes/conversations");

app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/conversations", conversationsRoutes);

let PORT = Number(getEnv("PORT", "5000"));

app.get("/health", (req, res) => res.json({ ok: true, port: PORT }));

app.get("/", (req, res) => {
  res.send(`Workzup API is running on port ${PORT} ✅`);
});

app.get("/jobs", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      where: { status: "ACTIVE" },
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
      distinct: ["category"],
    });
    const formatted = categories.map((c) => c.category).filter(Boolean);
    res.json(["All Jobs", "All Categories", ...formatted]);
  } catch (err) {
    res.json(["All Jobs", "All Categories", "Hospitality", "Retail"]);
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const reviews = await prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      name: r.reviewer?.firstName
        ? `${r.reviewer.firstName} ${r.reviewer.lastName || ""}`.trim()
        : "Anonymous User",
      role:
        r.reviewer?.role === "RECRUITER" || r.reviewer?.role === "EMPLOYER"
          ? "Employer"
          : "Job Seeker",
      avatar: r.reviewer?.firstName
        ? r.reviewer.firstName[0].toUpperCase()
        : "U",
      rating: r.rating || 5,
      text: r.comment || "",
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
});

app.get("/max-pay", async (req, res) => {
  try {
    const prisma = require("./prismaClient");
    const aggregation = await prisma.job.aggregate({
      _max: { pay: true },
    });
    res.json({ max: aggregation._max.pay || 5000 });
  } catch (err) {
    res.json({ max: 5000 });
  }
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

function startServer(portToTry) {
  const server = httpServer.listen(portToTry, () => {
    PORT = portToTry;
    console.log(`Backend running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (portToTry === 5000) {
        console.warn("Port 5000 is in use, falling back to 5001...");
        startServer(5001);
      } else {
        console.error(`Port ${portToTry} is also in use. Could not start server.`);
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(PORT);