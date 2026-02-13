import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobsRoutes from "./routes/jobs.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.CORS_ORIGIN
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "WorkzUp backend is running" });
});

app.use("/api/jobs", jobsRoutes);

const PORT = process.env.PORT || 5000;

await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
