/**
 * server.js — WorkzUp Express API entry point
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobsRoutes from "./routes/jobs.js";


dotenv.config();

const app = express();

//Parse incoming JSON bodies for all routes
app.use(express.json());


// Allow the Next.js dev server on common ports, plus any production origin


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



// Health check — used to verify the server is up without hitting DB
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "WorkzUp backend is running" });
});

//  All job CRUD operations are handled under /api/jobs
app.use("/api/jobs", jobsRoutes);

//  Start Server on PORT env var or 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
