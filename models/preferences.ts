import mongoose, { Schema, models, model } from "mongoose";

const PreferenceSchema = new Schema(
  {
    userId: { type: String, required: true }, // later replace with real login user id
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Preference =
  models.Preference || model("Preference", PreferenceSchema);
