const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* -------- Temporary Job Storage -------- */
let jobs = [];

/* -------- Post Job -------- */
app.post("/jobs", (req, res) => {
  const newJob = {
    id: Date.now(),
    ...req.body,
  };

  jobs.push(newJob);

  res.json({
    message: "Job created",
    job: newJob,
  });
});

/* -------- Get Jobs with Filters -------- */
app.get("/jobs", (req, res) => {
  const { keyword, district, pay, date, category, minPay, maxPay } = req.query;

  let filteredJobs = jobs;

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

  // Support old pay filter string format AND new min/max logic
  if (pay) {
    filteredJobs = filteredJobs.filter(job => {
      const jobPay = parseInt(job.pay.replace(/[^0-9]/g, "")) || 0;

      if (pay === "$40+") {
        return jobPay >= 40;
      }

      const [min, max] = pay.replace(/\$/g, "").split("-").map(Number);
      return jobPay >= min && jobPay <= max;
    });
  }

  if (minPay) {
    filteredJobs = filteredJobs.filter(job => {
      const jobPay = parseInt(job.pay.replace(/[^0-9]/g, "")) || 0;
      return jobPay >= parseInt(minPay);
    });
  }

  if (maxPay) {
    filteredJobs = filteredJobs.filter(job => {
      const jobPay = parseInt(job.pay.replace(/[^0-9]/g, "")) || 0;
      return jobPay <= parseInt(maxPay);
    });
  }

  if (date) {
    filteredJobs = filteredJobs.filter(job =>
      job.date === date
    );
  }

  if (category && category !== "All Jobs") {
    filteredJobs = filteredJobs.filter(job =>
      job.category && job.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(filteredJobs);
});




/* -------- Reviews Data -------- */
const reviews = [];

/* -------- Get Reviews -------- */
app.get("/reviews", (req, res) => {
  res.json(reviews);
});

/* -------- Post Review -------- */
app.post("/reviews", (req, res) => {
  console.log("Received POST /reviews:", req.body);

  if (!req.body || !req.body.text || !req.body.name) {
    return res.status(400).json({ error: "Missing required fields (name, text)" });
  }

  const newReview = {
    id: Date.now(),
    ...req.body,
  };
  reviews.unshift(newReview); // Add to top
  res.json({ message: "Review added", review: newReview });
});


/* -------- Start Server -------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
