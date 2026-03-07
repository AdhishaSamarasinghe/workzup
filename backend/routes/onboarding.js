const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken: auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/onboarding/status
router.get("/status", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { onboardingStep: true, isProfileComplete: true }
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    onboardingStep: user.onboardingStep,
    isProfileComplete: user.isProfileComplete,
  });
});

// PATCH /api/onboarding/step
router.patch("/step", auth, async (req, res) => {
  const { step } = req.body;

  if (typeof step !== "number")
    return res.status(400).json({ message: "step must be a number" });

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const nextStep = Math.max(user.onboardingStep, step);
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { onboardingStep: nextStep }
  });

  res.json({ message: "Updated", onboardingStep: updatedUser.onboardingStep });
});

module.exports = router;
