/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const { loadEnv, getEnv, validateRequiredEnv } = require("./config/env");

loadEnv();

const runtimeEnv = getEnv("NODE_ENV", "development");
const isProduction = runtimeEnv === "production";

function parseOriginList(rawValue) {
  return String(rawValue || "")
    .split(",")
    .map((entry) => entry.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, ""))
    .map((entry) => {
      const assignmentMatch = entry.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
      return assignmentMatch?.[1] ? assignmentMatch[1].trim() : entry;
    })
    .filter(Boolean)
    .map((entry) => {
      let candidate = entry;
      if (!/^https?:\/\//i.test(candidate)) {
        candidate = candidate.startsWith("localhost") || candidate.startsWith("127.0.0.1")
          ? `http://${candidate}`
          : `https://${candidate}`;
      }

      try {
        return new URL(candidate).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

function isVercelOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

console.log(`[startup] WorkzUp backend booting (${runtimeEnv})`);

try {
  const envReport = validateRequiredEnv();
  if (envReport.missingWarnings.length > 0) {
    console.warn(
      `[startup] Environment warning: missing optional variables: ${envReport.missingWarnings.join(", ")}.`,
    );
  }
} catch (error) {
  console.error("[startup] Environment configuration error:", error.message);
  process.exit(1);
}

const configuredOrigins = parseOriginList(
  [
    getEnv("FRONTEND_URL"),
    getEnv("CLIENT_URL"),
    getEnv("CORS_ORIGINS"),
    getEnv("ALLOWED_ORIGINS"),
  ]
    .filter(Boolean)
    .join(","),
);

const allowedOrigins = Array.from(
  new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...configuredOrigins,
  ]),
);

const allowVercelPreviews =
  String(getEnv("ALLOW_VERCEL_PREVIEWS", isProduction ? "true" : "false")).toLowerCase() === "true";

const { initSocket } = require("./socket");

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    // Deployment-friendly defaults for Next/Vercel frontend + Railway backend.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: false,
        }
      : false,
  })
);

app.use(
  cors({
    // Railway: set FRONTEND_URL to your deployed frontend domain
    // (e.g. https://your-frontend.up.railway.app) in service Variables.
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowVercelPreviews && isVercelOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "30mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log(`[startup] Server file: ${__filename}`);

// IMPORTANT: explicitly load admin folder index.js
const adminRoutes = require("./routes/admin/index");
console.log(`[startup] Admin routes: ${require.resolve("./routes/admin/index")}`);
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

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/", (_req, res) => {
  res.send("WorkzUp backend is running");
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
    console.log(`[startup] Backend listening on port ${PORT}`);
    console.log(`[startup] CORS allowed origins: ${allowedOrigins.join(", ")}`);
    console.log(`[startup] CORS allow Vercel previews: ${allowVercelPreviews}`);
  });

  server.on("error", (err) => {
    const message = err?.message || String(err);
    console.error(`[startup] Server failed to start on port ${portToTry}: ${message}`);
    process.exit(1);
  });

  return server;
}

const activeServer = startServer(PORT);

let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[startup] Received ${signal}. Shutting down gracefully...`);
  activeServer.close((err) => {
    if (err) {
      console.error("[startup] Graceful shutdown failed:", err);
      process.exit(1);
      return;
    }

    console.log("[startup] HTTP server closed.");
    process.exit(0);
  });

  // Force exit if something hangs during shutdown.
  setTimeout(() => {
    console.error("[startup] Force exiting after shutdown timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));