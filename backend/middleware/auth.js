const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { getSupabaseAdmin, migratePrismaUserId } = require("../lib/supabaseAdmin");
const { loadEnv, getEnv } = require("../config/env");

loadEnv();

function normalizeRole(role) {
  const key = String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (key === "JOBSEEKER" || key === "JOB_SEEKER") return "JOB_SEEKER";
  if (key === "RECRUITER") return "RECRUITER";
  if (key === "EMPLOYER") return "EMPLOYER";
  if (key === "ADMIN") return "ADMIN";

  return key;
}

function isRecoverableSupabaseNetworkError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || error?.cause?.code || "").toUpperCase();
  const causeMessage = String(error?.cause?.message || "").toLowerCase();

  return (
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    message.includes("fetch failed") ||
    message.includes("enotfound") ||
    causeMessage.includes("getaddrinfo enotfound")
  );
}

async function tryDecodeSupabaseAccessToken(token) {
  let decoded = null;

  const jwtSecret = getEnv("JWT_SECRET");
  if (jwtSecret) {
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      decoded = null;
    }
  }

  if (!decoded) {
    decoded = jwt.decode(token);
  }

  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  const payload = decoded;
  const userId =
    payload.sub ||
    payload.user_id ||
    payload.userId ||
    null;

  if (!userId || typeof userId !== "string") {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });

  return {
    userId,
    id: userId,
    sub: userId,
    role: normalizeRole(dbUser?.role || payload.role) || "JOB_SEEKER",
    email:
      dbUser?.email ||
      (typeof payload.email === "string" ? payload.email : null),
    firstName:
      dbUser?.firstName ||
      (typeof payload.user_metadata?.first_name === "string"
        ? payload.user_metadata.first_name
        : null),
    lastName:
      dbUser?.lastName ||
      (typeof payload.user_metadata?.last_name === "string"
        ? payload.user_metadata.last_name
        : null),
    companyName:
      typeof payload.user_metadata?.company_name === "string"
        ? payload.user_metadata.company_name
        : null,
    phone:
      dbUser?.phone ||
      (typeof payload.user_metadata?.phone === "string"
        ? payload.user_metadata.phone
        : null),
  };
}

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !/^Bearer\s+/i.test(header)) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = String(header)
    .replace(/^Bearer\s+/i, "")
    .replace(/^"|"$/g, "")
    .trim();

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && data?.user?.id) {
      const authUserId = data.user.id;
      const authEmail =
        typeof data.user.email === "string"
          ? data.user.email.trim().toLowerCase()
          : null;

      let dbUser = await prisma.user.findUnique({
        where: { id: authUserId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });

      if (!dbUser && authEmail) {
        const legacyUser = await prisma.user.findUnique({
          where: { email: authEmail },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        });

        if (legacyUser && legacyUser.id !== authUserId) {
          try {
            await migratePrismaUserId(legacyUser.id, authUserId);
            dbUser = await prisma.user.findUnique({
              where: { id: authUserId },
              select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            });
          } catch (migrationError) {
            console.error("Legacy auth user migration failed:", migrationError);
            dbUser = legacyUser;
          }
        }
      }

      req.user = {
        userId: authUserId,
        id: authUserId,
        sub: authUserId,
        role:
          normalizeRole(dbUser?.role) ||
          normalizeRole(data.user.app_metadata?.role) ||
          normalizeRole(data.user.user_metadata?.role) ||
          "JOB_SEEKER",
        email: dbUser?.email || data.user.email || null,
        firstName:
          dbUser?.firstName || data.user.user_metadata?.first_name || null,
        lastName:
          dbUser?.lastName || data.user.user_metadata?.last_name || null,
        companyName: data.user.user_metadata?.company_name || null,
        phone: dbUser?.phone || data.user.user_metadata?.phone || null,
      };
      return next();
    }
  } catch (err) {
    console.error("Supabase token verification failed:", err);

    if (
      process.env.NODE_ENV !== "production" &&
      isRecoverableSupabaseNetworkError(err)
    ) {
      try {
        const decodedUser = await tryDecodeSupabaseAccessToken(token);
        if (decodedUser?.userId) {
          req.user = decodedUser;
          return next();
        }
      } catch (decodeError) {
        console.error("Fallback token decode failed:", decodeError);
      }
    }
  }

  {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Forbidden: No role assigned" });
      }

      const currentRole = normalizeRole(req.user.role);
      const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

      if (normalizedAllowedRoles.includes(currentRole)) {
        return next();
      }

      const userId = req.user.userId || req.user.id || req.user.sub;

      // Fallback: check database directly in case Supabase token role is stale
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });
        const dbRole = normalizeRole(dbUser?.role);
        
        if (normalizedAllowedRoles.includes(dbRole)) {
            req.user.role = dbRole;
            return next();
        }
      }

      const allowsJobSeeker = normalizedAllowedRoles.includes("JOB_SEEKER");

      if (allowsJobSeeker && userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (normalizeRole(dbUser?.role) === "JOB_SEEKER") {
          req.user.role = "JOB_SEEKER";
          return next();
        }

        const seekerProfile = await prisma.seekerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (seekerProfile) {
          req.user.role = "JOB_SEEKER";
          return next();
        }
      }

      return res.status(403).json({ message: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
    } catch (err) {
      console.error("requireRole Error:", err);
      return res.status(500).json({ message: "Server Error" });
    }
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  // Export `auth` for backwards compatibility with any routes that use `const auth = require('./auth');` directly
  auth: authenticateToken
};
