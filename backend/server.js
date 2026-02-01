import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobsRoutes from "./routes/jobs.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "WorkzUp backend is running" });
});

app.use("/api/jobs", jobsRoutes);

const PORT = process.env.PORT || 5000;

await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
