const prisma = require("../prismaClient");
const { getSupabaseAdmin } = require("../lib/supabaseAdmin");

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
      req.user = {
        userId: data.user.id,
        id: data.user.id,
        sub: data.user.id,
        role:
          normalizeRole(data.user.app_metadata?.role) ||
          normalizeRole(data.user.user_metadata?.role) ||
          "JOB_SEEKER",
        email: data.user.email || null,
        firstName: data.user.user_metadata?.first_name || null,
        lastName: data.user.user_metadata?.last_name || null,
        companyName: data.user.user_metadata?.company_name || null,
        phone: data.user.user_metadata?.phone || null,
      };
      return next();
    }
  } catch (err) {
    console.error("Supabase token verification failed:", err);
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

      const allowsJobSeeker = normalizedAllowedRoles.includes("JOB_SEEKER");
      const userId = req.user.userId || req.user.id || req.user.sub;

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
