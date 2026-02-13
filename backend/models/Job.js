import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    pay: { type: Number, required: true },
    payType: { type: String, enum: ["hour", "day"], default: "hour" },
    category: { type: String, default: "Hospitality" },
    locations: [{ type: String, required: true, trim: true }],
    jobDates: [{ type: Date, required: true }],
    startTime: { type: String }, // e.g. "09:00"
    endTime: { type: String },   // e.g. "17:00"
    requirements: [{ type: String }],
    status: { type: String, enum: ["DRAFT", "PUBLIC", "PRIVATE"], default: "DRAFT" },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
