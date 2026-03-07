const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // onboarding state
    onboardingStep: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },

    // role selection
    role: {
      type: String,
      enum: ["JOB_SEEKER", "EMPLOYER"],
      default: null,
    },

    // profile fields
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    homeTown: { type: String },
    cv: { type: String }, // URL or path
    termsAccepted: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
