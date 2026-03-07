const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/onboarding/status
router.get("/status", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select(
    "onboardingStep isProfileComplete"
  );

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

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.onboardingStep = Math.max(user.onboardingStep, step);
  await user.save();

  res.json({ message: "Updated", onboardingStep: user.onboardingStep });
});

module.exports = router;
