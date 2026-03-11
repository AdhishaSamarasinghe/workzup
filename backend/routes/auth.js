const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../prismaClient");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

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
router.post("/register", upload.single("cv"), async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      gender,
      homeTown,
      termsAccepted,
      emailNotifications,
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Get CV path if file uploaded
    const cvPath = req.file ? req.file.path : null;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || null,
        firstName,
        lastName,
        gender,
        homeTown,
        cv: cvPath,
        termsAccepted: termsAccepted === "true" || termsAccepted === true, // Multipart sends strings
        emailNotifications: emailNotifications === "true" || emailNotifications === true,
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
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
      title: user.seekerProfile?.bio ? user.seekerProfile.bio.split(".")[0] : "Professional",
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
      education, experience, socialLinks, languages 
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
        homeTown: location
      }
    });

    // Then upsert the SeekerProfile
    await prisma.seekerProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        bio: aboutMe,
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        socialLinks: mergedSocialLinks,
        languages: languages || []
      },
      create: {
        userId: req.user.userId,
        bio: aboutMe,
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        socialLinks: mergedSocialLinks,
        languages: languages || []
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

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
