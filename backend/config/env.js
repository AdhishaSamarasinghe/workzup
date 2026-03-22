const path = require("path");
const dotenv = require("dotenv");

let hasLoadedEnv = false;

function loadEnv() {
  if (hasLoadedEnv) {
    return;
  }

  const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  // In production (e.g. Railway), rely on injected environment variables only.
  if (isProduction) {
    hasLoadedEnv = true;
    return;
  }

  const candidateFiles = [
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../.env.local"),
  ];

  for (const envFile of candidateFiles) {
    dotenv.config({ path: envFile, override: false });
  }

  hasLoadedEnv = true;
}

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (value == null || String(value).trim() === "") {
    return fallback;
  }

  return String(value)
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "");
}

function isValidPostgresUrl(value) {
  return /^postgres(?:ql)?:\/\//i.test(String(value || "").trim());
}

function getFirstAvailableEnv(names, fallback = "") {
  for (const name of names) {
    const value = getEnv(name);
    if (value) {
      return value;
    }
  }

  return fallback;
}

function validateRequiredEnv() {
  loadEnv();

  const envChecks = [
    { key: "DATABASE_URL", aliases: [], level: "error" },
    { key: "JWT_SECRET", aliases: [], level: "warn" },
    { key: "FRONTEND_URL", aliases: ["CLIENT_URL"], level: "warn" },
    { key: "GOOGLE_CLIENT_ID", aliases: [], level: "warn" },
    { key: "GOOGLE_CLIENT_SECRET", aliases: [], level: "warn" },
    { key: "EMAIL_USER", aliases: ["SMTP_USER"], level: "warn" },
    { key: "EMAIL_PASS", aliases: ["SMTP_PASS"], level: "warn" },
  ];

  const missingErrors = [];
  const missingWarnings = [];

  for (const check of envChecks) {
    const value = getFirstAvailableEnv([check.key, ...check.aliases]);
    if (value) {
      if (!process.env[check.key]) {
        process.env[check.key] = value;
      }
      continue;
    }

    if (check.level === "error") {
      missingErrors.push(check.key);
    } else {
      missingWarnings.push(check.key);
    }
  }

  const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  if (!process.env.FRONTEND_URL && !isProduction) {
    process.env.FRONTEND_URL = "http://localhost:3000";
  }

  if (missingErrors.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingErrors.join(", ")}. Set these in Railway Variables for production or backend/.env for local development.`,
    );
  }

  const databaseUrl = getEnv("DATABASE_URL");
  if (!isValidPostgresUrl(databaseUrl)) {
    throw new Error(
      "DATABASE_URL is malformed. It must start with postgresql:// or postgres://. In Railway, set DATABASE_URL to your Postgres connection string value (not a placeholder like 'base').",
    );
  }

  return {
    missingWarnings,
  };
}

module.exports = {
  loadEnv,
  getEnv,
  getFirstAvailableEnv,
  validateRequiredEnv,
};
