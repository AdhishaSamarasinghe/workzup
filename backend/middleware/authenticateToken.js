const prisma = require("../prismaClient");
const { getSupabaseAdmin } = require("../lib/supabaseAdmin");
const { loadEnv } = require("../config/env");

loadEnv();

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "").trim();

    if (!/^Bearer\s+/i.test(authHeader)) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader
      .replace(/^Bearer\s+/i, "")
      .replace(/^"|"$/g, "")
      .trim();

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      console.warn("authenticateToken: token validation failed", error?.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const authUser = data.user;
    const authUserId = String(authUser.id || "").trim();
    const authEmail = normalizeEmail(authUser.email);

    let appUser = null;

    if (authUserId) {
      appUser = await prisma.user.findUnique({
        where: { id: authUserId },
      });
    }

    if (!appUser && authEmail) {
      appUser = await prisma.user.findUnique({
        where: { email: authEmail },
      });
    }


    if (!appUser) {
      return res.status(403).json({
        success: false,
        message: "User not found in application database",
      });
    }

    req.authUser = authUser;
    req.appUser = appUser;
    req.user = {
      userId: appUser.id,
      id: appUser.id,
      sub: appUser.id,
      role: appUser.role,
      email: appUser.email,
    };

    next();
  } catch (error) {
    console.error("authenticateToken error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

module.exports = authenticateToken;