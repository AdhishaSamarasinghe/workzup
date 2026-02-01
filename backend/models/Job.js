import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    pay: { type: Number, required: true },
    payType: { type: String, enum: ["hour", "day"], default: "hour" },
    category: { type: String, default: "Hospitality" },
    location: { type: String, required: true, trim: true },
    jobDate: { type: Date, required: true },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
