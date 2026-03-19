const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../prismaClient");
const { authenticateToken } = require("../middleware/auth");
const { sendOTP } = require("../lib/emailService");
const {
  buildSupabaseMetadata,
  createSupabaseUser,
  ensureSupabaseUserForLegacyUser,
  getSupabaseAdmin,
  getSupabaseUserByEmail,
  migratePrismaUserId,
  normalizeRole: normalizeSupabaseRole,
  updateSupabaseUser,
} = require("../lib/supabaseAdmin");

const router = express.Router();

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

function buildAllowedRoles(expectedRole) {
  const expected = Array.isArray(expectedRole) ? expectedRole : [expectedRole];
  const normalized = expected
    .map(normalizeRole)
    .filter(Boolean);

  if (normalized.includes("EMPLOYER") || normalized.includes("RECRUITER")) {
    if (!normalized.includes("EMPLOYER")) normalized.push("EMPLOYER");
    if (!normalized.includes("RECRUITER")) normalized.push("RECRUITER");
  }

  return normalized;
}

const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const avatarStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join("uploads", "avatars");
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Basic file filter for docs/pdf/images
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Upload only supports PDF, DOC, DOCX, JPG, PNG"));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Upload only supports JPG, PNG, or WEBP"));
  }
});

const buildAvatarUrl = (req, storedPath, firstName, lastName) => {
  if (storedPath) {
    const normalizedPath = String(storedPath).replace(/\\/g, "/").replace(/^\/+/, "");
    return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
  }

  return `https://ui-avatars.com/api/?name=${firstName || 'Job'}+${lastName || 'Seeker'}&background=random`;
};

// PATCH /api/auth/role
router.patch("/role", authenticateToken, async (req, res) => {
  const { role } = req.body;

  if (!["JOB_SEEKER", "EMPLOYER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { role: role }
  });

  res.json({ message: "Role updated", role: updatedUser.role });
});

// POST /api/auth/register
const registerUpload = upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'companyLogo', maxCount: 1 }]);

router.post("/register", (req, res, next) => {
  registerUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      gender,
      homeTown,
      phone,
      companyName,
      companyAddress,
      termsAccepted,
      emailNotifications,
    } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = normalizeSupabaseRole(role || "JOB_SEEKER");
    const userMetadata = buildSupabaseMetadata({
      firstName,
      lastName,
      phone,
      role: normalizedRole,
      companyName,
    });

    // Validate required fields
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ message: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Get file paths if uploaded
    const cvPath = req.files && req.files['cv'] ? req.files['cv'][0].path.replace(/\\/g, "/") : null;
    const companyLogoPath = req.files && req.files['companyLogo'] ? req.files['companyLogo'][0].path.replace(/\\/g, "/") : null;
    let supabaseUser;

    try {
      supabaseUser = await createSupabaseUser({
        email: normalizedEmail,
        password,
        role: normalizedRole,
        metadata: userMetadata,
        emailConfirmed: true,
      });
    } catch (error) {
      const message = String(error?.message || "");
      const status = Number(error?.status || 0);
      const looksLikeExistingSupabaseUser =
        status === 422 ||
        status === 409 ||
        /already registered|already been registered|email.*exists|duplicate/i.test(message);

      if (!looksLikeExistingSupabaseUser) {
        throw error;
      }

      const existingSupabaseUser = await getSupabaseUserByEmail(normalizedEmail);
      if (!existingSupabaseUser) {
        throw error;
      }

      const prismaUserBySupabaseId = await prisma.user.findUnique({
        where: { id: existingSupabaseUser.id },
      });

      if (prismaUserBySupabaseId) {
        return res.status(409).json({
          message: "Email already used. Please sign in instead.",
        });
      }

      await updateSupabaseUser(existingSupabaseUser.id, {
        password,
        metadata: userMetadata,
        role: normalizedRole,
      });

      supabaseUser = existingSupabaseUser;
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: normalizedEmail,
        passwordHash,
        role: normalizedRole || null,
        firstName,
        lastName,
        gender,
        homeTown,
        phone,
        cv: cvPath,
        termsAccepted: termsAccepted === "true" || termsAccepted === true, // Multipart sends strings
        emailNotifications: emailNotifications === "true" || emailNotifications === true,
      }
    });

    // Create Company if role is EMPLOYER/RECRUITER and companyName is provided
    if ((normalizedRole === "EMPLOYER" || normalizedRole === "RECRUITER") && companyName) {
      await prisma.company.create({
        data: {
          recruiterId: user.id,
          name: companyName,
          logoUrl: companyLogoPath,
          address: companyAddress || null
        }
      });
    }

    res.json({
      success: true,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const tokenRole = user.role;

  if (expectedRole) {
    const currentRole = normalizeRole(tokenRole);
    const allowedRoles = buildAllowedRoles(expectedRole);

    if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
      const displayRoles = allowedRoles.join(", ");
      return res.status(403).json({
        message: `This account cannot sign in here. Required role: ${displayRoles}. Please use the correct account for this portal.`,
      });
    }
  }

  res.json({
    success: true,
    role: tokenRole,
    userId: user.id,
    requiresSupabaseSignIn: true,
    message: "Credentials verified. Complete sign-in through Supabase Auth.",
  });
});

// POST /api/auth/migrate-login
router.post("/migrate-login", async (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (expectedRole) {
      const currentRole = normalizeRole(user.role);
      const allowedRoles = buildAllowedRoles(expectedRole);

      if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        return res.status(403).json({
          message: `This account cannot sign in here. Required role: ${allowedRoles.join(", ")}.`,
        });
      }
    }

    const supabaseUser = await ensureSupabaseUserForLegacyUser(user, password);

    const refreshedUser = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
      select: { id: true, role: true },
    });

    return res.json({
      success: true,
      migrated: true,
      supabaseUserId: supabaseUser.id,
      userId: refreshedUser?.id || supabaseUser.id,
      role: refreshedUser?.role || user.role,
    });
  } catch (error) {
    console.error("Migrate Login Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to migrate user to Supabase auth.",
    });
  }
});

// POST /api/auth/oauth-sync
router.post("/oauth-sync", authenticateToken, async (req, res) => {
  const desiredRole = normalizeSupabaseRole(req.body?.role || req.user?.role || "JOB_SEEKER");

  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user && req.user.email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      if (existingByEmail && existingByEmail.id !== req.user.userId) {
        await migratePrismaUserId(existingByEmail.id, req.user.userId);
      }

      user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: req.user.userId,
          email: req.user.email,
          passwordHash: await bcrypt.hash(`${req.user.userId}:${Date.now()}`, 10),
          role: desiredRole,
          firstName: req.user.firstName || null,
          lastName: req.user.lastName || null,
          phone: req.user.phone || null,
          termsAccepted: true,
          emailNotifications: true,
        },
      });

      if ((desiredRole === "EMPLOYER" || desiredRole === "RECRUITER") && req.user.companyName) {
        await prisma.company.create({
          data: {
            recruiterId: user.id,
            name: req.user.companyName,
          },
        });
      }
    } else if (user.role !== desiredRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: desiredRole },
      });
    }

    return res.json({
      success: true,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error("OAuth Sync Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to sync OAuth user.",
    });
  }
});

// GET /api/auth/profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        seekerProfile: true,
        receivedReviews: {
          include: { reviewer: true }
        },
        applications: {
          include: { job: { include: { company: true } } }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobsCompleted = user.applications.filter(a => a.status === "COMPLETED" || a.status === "HIRED").length;
    const reliability = 98; 

    const reviews = user.receivedReviews.map(r => ({
      id: r.id,
      name: r.reviewer?.firstName ? `${r.reviewer.firstName} ${r.reviewer.lastName || ''}`.trim() : "Anonymous",
      role: r.reviewer?.role === "EMPLOYER" ? "Employer" : "User",
      date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      rating: r.rating,
      text: r.comment || "No comment provided."
    }));

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

    const jobHistory = user.applications
      .filter(app => app.status === "HIRED" || app.status === "COMPLETED")
      .map(app => ({
        id: app.id,
        name: app.job?.title || "Unknown Job",
        role: app.job?.category || "Worker",
        date: new Date(app.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      }));

    const profileData = {
      id: user.id,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Job Seeker",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      title: user.seekerProfile?.title || "Professional",
      location: user.homeTown || "Sri Lanka",
      avatar: buildAvatarUrl(req, user.seekerProfile?.socialLinks?.avatarUrl, user.firstName, user.lastName),
      isAvailable: true,
      stats: {
        jobsCompleted,
        reliability
      },
      skills: user.seekerProfile?.skills?.length ? user.seekerProfile.skills : ["Teamwork", "Communication", "Time Management", "Problem Solving"],
      aboutMe: user.seekerProfile?.bio || "I am an enthusiastic and dedicated professional looking for my next opportunity to grow and contribute to a successful team. I take pride in my work and strive to deliver excellent results.",
      reviewsSummary: {
        averageRating,
        totalReviews
      },
      reviews,
      jobHistory,
      education: user.seekerProfile?.education || [],
      experience: user.seekerProfile?.experience || [],
      socialLinks: user.seekerProfile?.socialLinks || { linkedin: "", github: "", portfolio: "", avatarUrl: "" },
      languages: user.seekerProfile?.languages || [],
      availableTimes: user.seekerProfile?.availability?.length > 0 ? user.seekerProfile.availability.join(", ") : "",
      cv: user.cv || null,
      idDocument: user.idDocument || null,
      idFront: user.idFront || null,
      idBack: user.idBack || null
    };

    res.json(profileData);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/auth/upload-avatar
router.post("/upload-avatar", authenticateToken, avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar uploaded" });
    }

    const existingProfile = await prisma.seekerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const existingSocialLinks = existingProfile?.socialLinks && typeof existingProfile.socialLinks === "object"
      ? existingProfile.socialLinks
      : {};

    const avatarPath = req.file.path.replace(/\\/g, "/");

    await prisma.seekerProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        socialLinks: {
          ...existingSocialLinks,
          avatarUrl: avatarPath,
        },
      },
      create: {
        userId: req.user.userId,
        socialLinks: {
          ...existingSocialLinks,
          avatarUrl: avatarPath,
        },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    res.json({
      message: "Avatar uploaded successfully",
      data: {
        avatarPath,
        avatarUrl: buildAvatarUrl(req, avatarPath, user?.firstName, user?.lastName),
      },
    });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/auth/upload-docs
router.post("/upload-docs", authenticateToken, upload.fields([
  { name: 'cv', maxCount: 1 }, 
  { name: 'idDocument', maxCount: 1 },
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = {};
    if (req.files && req.files['cv'] && req.files['cv'][0]) {
      updateData.cv = req.files['cv'][0].path;
    }
    if (req.files && req.files['idDocument'] && req.files['idDocument'][0]) {
      updateData.idDocument = req.files['idDocument'][0].path;
    }
    if (req.files && req.files['idFront'] && req.files['idFront'][0]) {
      updateData.idFront = req.files['idFront'][0].path;
    }
    if (req.files && req.files['idBack'] && req.files['idBack'][0]) {
      updateData.idBack = req.files['idBack'][0].path;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    res.json({ message: "Documents uploaded successfully", data: updateData });
  } catch (error) {
    console.error("Upload Docs Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /api/auth/profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { 
      firstName, lastName, location, aboutMe, title, skills, 
      education, experience, socialLinks, languages, phone, availableTimes
    } = req.body;

    const existingProfile = await prisma.seekerProfile.findUnique({
      where: { userId: req.user.userId },
    });
    const existingSocialLinks = existingProfile?.socialLinks && typeof existingProfile.socialLinks === "object"
      ? existingProfile.socialLinks
      : {};
    const mergedSocialLinks = socialLinks
      ? { ...existingSocialLinks, ...socialLinks }
      : existingSocialLinks;

    // First update the core User
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName: firstName,
        lastName: lastName,
        homeTown: location,
        phone: phone || null
      }
    });

    // Then upsert the SeekerProfile
    await prisma.seekerProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        title: title || existingProfile?.title,
        bio: aboutMe,
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        socialLinks: mergedSocialLinks,
        languages: languages || [],
        availability: availableTimes ? String(availableTimes).split(",").map(s => s.trim()).filter(Boolean) : []
      },
      create: {
        userId: req.user.userId,
        title: title,
        bio: aboutMe,
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        socialLinks: mergedSocialLinks,
        languages: languages || [],
        availability: availableTimes ? String(availableTimes).split(",").map(s => s.trim()).filter(Boolean) : []
      }
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /api/auth/password
router.put("/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: newPasswordHash }
    });
    await ensureSupabaseUserForLegacyUser(user, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Mock OTP storage (In production, use Redis or DB with expiry)
const otpStore = new Map();

// POST /api/auth/profile/send-email-otp
router.post("/profile/send-email-otp", authenticateToken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ message: "A valid new email is required" });
    }

    // Check if email is already in use
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return res.status(409).json({ message: "Email is already in use by another account" });
    }

    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store it alongside the user ID and the requested new email, expire in 10 mins
    otpStore.set(req.user.userId, {
      otp,
      newEmail,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send real email
    const emailSent = await sendOTP(newEmail, otp, false);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email. Please try again later." });
    }

    res.json({ message: `OTP sent to ${newEmail}` });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/auth/profile/verify-email-otp
router.post("/profile/verify-email-otp", authenticateToken, async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    
    if (!newEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = otpStore.get(req.user.userId);
    
    if (!record) {
      return res.status(400).json({ message: "No OTP request found. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(req.user.userId);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.newEmail !== newEmail || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP or Email combination." });
    }

    // Verify success, update the User
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { email: newEmail }
    });
    await updateSupabaseUser(req.user.userId, {
      email: newEmail,
      metadata: buildSupabaseMetadata({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: updatedUser.role,
      }),
      role: updatedUser.role,
    });

    // Clean up
    otpStore.delete(req.user.userId);

    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/auth/profile
router.delete("/profile", authenticateToken, async (req, res) => {
  try {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.auth.admin.deleteUser(req.user.userId);
    } catch (supabaseError) {
      console.warn("Supabase delete user warning:", supabaseError?.message || supabaseError);
    }

    // Prisma `onDelete: Cascade` handles related records (SeekerProfile, etc)
    // if configured correctly in the schema.
    await prisma.user.delete({
      where: { id: req.user.userId }
    });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// POST /api/auth/forgot-password/request
router.post("/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "This email address is not registered. Please sign up or try another." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Key by email so unauthenticated users can reset
    otpStore.set(`RESET_${email}`, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send real email
    const emailSent = await sendOTP(email, otp, true);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send password reset email. Please try again later." });
    }

    res.json({ message: "A password reset code has been sent to your email." });
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/auth/forgot-password/reset
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const record = otpStore.get(`RESET_${email}`);
    
    if (!record) {
      return res.status(400).json({ message: "No reset request found. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(`RESET_${email}`);
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    const legacyUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!legacyUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await ensureSupabaseUserForLegacyUser(legacyUser, newPassword);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    otpStore.delete(`RESET_${email}`);

    res.json({ message: "Password has been successfully reset." });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
