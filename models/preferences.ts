import mongoose, { Schema, models, model } from "mongoose";

const PreferenceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true, // later replace with real login user id
    },

    // ✅ NEW: primary role from Step 1
    primaryRole: {
      type: String,
      default: "",
    },

    // ✅ NEW: experience from Step 2
    experience: {
      type: String,
      default: "",
    },

    // ✅ EXISTING: skills from Step 3
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const Preference =
  models.Preference || model("Preference", PreferenceSchema);

