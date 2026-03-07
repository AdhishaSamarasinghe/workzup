/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const connectDB = require("./config/db");
// const { globalLimiter } = require("./middleware/rateLimiter"); // Uncomment if exists
// const errorHandler = require("./middleware/errorHandler"); // Uncomment if exists
const recruiterRoutes = require("./routes/recruiter");

dotenv.config();

const app = express();

// Trust reverse proxy (e.g., Heroku, Render, AWS, Nginx)
app.set("trust proxy", 1);

// Security Hardening
app.use(helmet());
// app.use(globalLimiter); 

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectDB();

// Routes Imports
const authRoutes = require("./routes/auth");
const onboardingRoutes = require("./routes/onboarding");
const jobRoutes = require("./routes/jobs");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiter", recruiterRoutes);

/* -------- Home Route -------- */
app.get("/", (req, res) => res.send("Workzup API running ✅"));

/* -------- Temporary Job Storage -------- */
// TODO: Replace this in-memory array with a real database connection
let jobs = [];

/* -------- Smart Auto-Categorization Logic -------- */
const classifyJob = (job) => {
  if (job.category && job.category.trim() !== "") return job.category;

  const text = `${job.title} ${job.description}`.toLowerCase();

  const rules = {
    "Events": ["event", "stage", "sound", "light", "hall", "ticket", "usher", "party", "wedding", "concert", "setup"],
    "Hospitality": ["hotel", "banquet", "chef", "cook", "waiter", "waitress", "guest", "resort", "kitchen", "barista", "restaurant"],
    "Logistics": ["driver", "delivery", "rider", "warehouse", "packer", "mover", "truck", "courier", "distribution"],
    "Retail": ["shop", "store", "cashier", "sales", "retail", "stock", "shelf", "supermarket", "customer"],
    "Cleaning": ["clean", "janitor", "housekeep", "maid", "washer"],
    "Admin": ["data", "entry", "clerk", "admin", "office", "typist", "assistant"]
  };

  let bestMatch = "General";
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(rules)) {
    let score = 0;
    keywords.forEach(word => {
      if (text.includes(word)) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
};

/* -------- Post Job -------- */
app.post("/jobs", (req, res) => {
  if (Array.isArray(req.body)) {
    const createdJobs = req.body.map((job, index) => ({
      id: Date.now() + index,
      ...job,
      category: classifyJob(job),
      status: job.status || "Active",
      applicants: job.applicants || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0]
    }));
    jobs.push(...createdJobs);
    return res.json({ message: "Batch jobs created", count: createdJobs.length, jobs: createdJobs });
  }

  const newJob = {
    id: Date.now(),
    ...req.body,
    category: classifyJob(req.body),
    status: "Active",
    applicants: 0,
    postedDate: new Date().toISOString().split('T')[0]
  };

  jobs.push(newJob);

  res.json({
    message: "Job created",
    job: newJob,
  });
});

/* -------- Get Jobs with Filters -------- */
app.get("/jobs", (req, res) => {
  console.log("GET /jobs params:", req.query);
  const { keyword, district, pay, date, category, minPay, maxPay } = req.query;

  let filteredJobs = jobs;

  if (category && category !== "All Jobs") {
    filteredJobs = filteredJobs.filter(job =>
      job.category && job.category.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  if (keyword) {
    filteredJobs = filteredJobs.filter(job =>
      job.title && job.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  if (district) {
    filteredJobs = filteredJobs.filter(job =>
      job.location && job.location.toLowerCase().includes(district.toLowerCase())
    );
  }

  if (pay) {
    filteredJobs = filteredJobs.filter(job => {
      const payStr = job.pay ? String(job.pay) : "";
      const numbers = payStr.match(/\d+/g);
      const jobMaxPay = numbers ? Math.max(...numbers.map(n => parseInt(n, 10))) : 0;

      if (pay === "$40+") {
        return jobMaxPay >= 40;
      }

      const [min, max] = pay.replace(/\$/g, "").split("-").map(Number);
      return jobMaxPay >= min && jobMaxPay <= max;
    });
  }

  if (minPay) {
    filteredJobs = filteredJobs.filter(job => {
      const payStr = job.pay ? String(job.pay) : "";
      const numbers = payStr.match(/\d+/g);
      const jobMaxPay = numbers ? Math.max(...numbers.map(n => parseInt(n, 10))) : 0;
      return jobMaxPay >= parseInt(minPay);
    });
  }

  if (maxPay) {
    filteredJobs = filteredJobs.filter(job => {
      const payStr = job.pay ? String(job.pay) : "";
      const numbers = payStr.match(/\d+/g);
      const jobMaxPay = numbers ? Math.max(...numbers.map(n => parseInt(n, 10))) : 0;
      return jobMaxPay <= parseInt(maxPay);
    });
  }

  if (date) {
    filteredJobs = filteredJobs.filter(job =>
      job.date === date
    );
  }

  res.json(filteredJobs);
});

/* -------- Start Server -------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
