const jwt = require("jsonwebtoken");

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

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId: "...", role: "..." }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Forbidden: No role assigned" });
    }

    const currentRole = normalizeRole(req.user.role);
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

    if (!normalizedAllowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  // Export `auth` for backwards compatibility with any routes that use `const auth = require('./auth');` directly
  auth: authenticateToken
};
