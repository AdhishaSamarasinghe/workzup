const jwt = require("jsonwebtoken");

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

    if (!allowedRoles.includes(req.user.role)) {
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
