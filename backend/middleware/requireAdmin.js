function requireAdmin(req, res, next) {
  console.log("=== requireAdmin HIT ===");
  console.log("REQ.APPUSER:", req.appUser);

  const appUser = req.appUser;

  if (!appUser) {
    return res.status(401).json({
      success: false,
      message: "Unauthenticated user",
    });
  }

  if (appUser.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: `Forbidden: role is ${appUser.role}, expected ADMIN`,
    });
  }

  if (appUser.isBanned) {
    return res.status(403).json({
      success: false,
      message: "Admin account is banned",
    });
  }

  next();
}

module.exports = requireAdmin;