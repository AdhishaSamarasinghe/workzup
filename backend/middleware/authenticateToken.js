const { createClient } = require("@supabase/supabase-js");
const prisma = require("../prismaClient");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function authenticateToken(req, res, next) {
  try {
    console.log("=== authenticateToken HIT ===");

    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      console.log("FAILED: Invalid token", error?.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.log("SUPABASE USER EMAIL:", data.user.email);

    const appUser = await prisma.user.findUnique({
      where: { email: data.user.email },
    });

    console.log("DB APP USER:", appUser);

    if (!appUser) {
      return res.status(403).json({
        success: false,
        message: "User not found in application database",
      });
    }

    req.authUser = data.user;
    req.appUser = appUser;

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