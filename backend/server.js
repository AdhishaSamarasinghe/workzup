const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* -------- Temporary Job Storage -------- */
/* -------- Temporary Job Storage -------- */
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
      category: classifyJob(job) // Auto-detect if missing
    }));
    jobs.push(...createdJobs);
    return res.json({ message: "Batch jobs created", count: createdJobs.length, jobs: createdJobs });
  }

  const newJob = {
    id: Date.now(),
    ...req.body,
    category: classifyJob(req.body) // Auto-detect if missing
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

  // ... (existing filters)

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

  // Support old pay filter string format AND new min/max logic
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
      // For filtering "at least X", we should probably look at the highest potential pay of the job? 
      // Or the lowest? Usually "Is this job within my range?" 
      // If job says $20-$30, and I want min $25, does it match? Yes, it *can* pay $30.
      const jobMaxPay = numbers ? Math.max(...numbers.map(n => parseInt(n, 10))) : 0;
      return jobMaxPay >= parseInt(minPay);
    });
  }

  if (maxPay) {
    filteredJobs = filteredJobs.filter(job => {
      const payStr = job.pay ? String(job.pay) : "";
      const numbers = payStr.match(/\d+/g);
      // For "max pay", if job is $20-$30 and I filter max $25... 
      // Maybe we compare the *lowest* pay? or just consistent max?
      // Let's stick to comparing the Max potential pay for consistency.
      const jobMaxPay = numbers ? Math.max(...numbers.map(n => parseInt(n, 10))) : 0;
      return jobMaxPay <= parseInt(maxPay);
    });
  }

  if (date) {
    filteredJobs = filteredJobs.filter(job =>
      job.date === date
    );
  }

  if (category && category !== "All Jobs") {
    filteredJobs = filteredJobs.filter(job =>
      job.category && job.category.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  res.json(filteredJobs);
});





/* -------- Get Categories -------- */
app.get("/categories", (req, res) => {
  const categories = [...new Set(jobs.map(job => job.category).filter(Boolean))];
  res.json(categories);
});

/* -------- Get Max Pay -------- */
app.get("/max-pay", (req, res) => {
  let maxPay = 0;
  jobs.forEach(job => {
    const payStr = job.pay ? String(job.pay) : "";
    // Match all numbers in the string
    const numbers = payStr.match(/\d+/g);
    if (numbers) {
      // Find max number in this specific job's pay string (handles "20-30" => 30)
      const jobMax = Math.max(...numbers.map(n => parseInt(n, 10)));
      if (jobMax > maxPay) maxPay = jobMax;
    }
  });
  // If no jobs or max is 0, return a default fallback (e.g. 1000) so the slider isn't broken
  res.json({ max: maxPay > 0 ? maxPay : 1000 });
});

/* -------- Reviews Data -------- */
const reviews = [];

/* -------- Get Reviews -------- */
app.get("/reviews", (req, res) => {
  res.json(reviews);
});

/* -------- Post Review -------- */
app.post("/reviews", (req, res) => {
  if (Array.isArray(req.body)) {
    const createdReviews = req.body.map((review, index) => ({
      id: Date.now() + index,
      ...review
    }));
    reviews.unshift(...createdReviews); // Add to top
    return res.json({ message: "Batch reviews added", count: createdReviews.length, reviews: createdReviews });
  }

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
