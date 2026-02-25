const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* -------- Temporary Job Storage -------- */
/* -------- Temporary Job Storage -------- */
// TODO: Replace this in-memory array with a real database connection (e.g., MongoDB, PostgreSQL)
// const db = require('./config/db');
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
      category: classifyJob(job), // Auto-detect if missing
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
    category: classifyJob(req.body), // Auto-detect if missing
    status: "Active", // Default status
    applicants: 0,    // Default applicants
    postedDate: new Date().toISOString().split('T')[0] // Current date YYYY-MM-DD
  };

  jobs.push(newJob);

  res.json({
    message: "Job created",
    job: newJob,
  });
});

/* -------- Get Single Job -------- */
app.get("/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const job = jobs.find(j => String(j.id) === String(jobId) || String(j._id) === String(jobId));
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

/* -------- Update Job -------- */
app.put("/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const index = jobs.findIndex(j => String(j.id) === String(jobId) || String(j._id) === String(jobId));

  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...req.body };
    res.json({ message: "Job updated", job: jobs[index] });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

/* -------- Delete Job -------- */
app.delete("/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const initialLength = jobs.length;
  jobs = jobs.filter(j => String(j.id) !== String(jobId) && String(j._id) !== String(jobId));

  if (jobs.length < initialLength) {
    res.json({ message: "Job deleted" });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
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
  // Helper to validate and format a single review
  const processReview = (review, index) => {
    if (!review.name || !review.text) return null;

    // Generate initials for avatar if missing
    let avatar = review.avatar;
    if (!avatar && review.name) {
      avatar = review.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    }

    return {
      id: Date.now() + index + Math.random(), // Ensure unique ID
      ...review,
      avatar: avatar || "U", // Fallback
      rating: review.rating || 5, // Default rating
      role: review.role || "User"
    };
  };

  // Handle Batch Upload
  if (Array.isArray(req.body)) {
    const validReviews = req.body
      .map((r, i) => processReview(r, i))
      .filter(r => r !== null);

    if (validReviews.length === 0) {
      return res.status(400).json({ error: "No valid reviews found in batch." });
    }

    reviews.unshift(...validReviews); // Add to top
    return res.json({
      message: "Batch reviews added",
      count: validReviews.length,
      reviews: validReviews
    });
  }

  // Handle Single Review
  const newReview = processReview(req.body, 0);
  if (!newReview) {
    return res.status(400).json({ error: "Missing required fields (name, text)" });
  }

  reviews.unshift(newReview); // Add to top
  res.json({ message: "Review added", review: newReview });
});



/* -------- Job Seeker Profile Data -------- */
// Mock data for the specific layout requested
let jobSeekerProfile = {
  id: "user_123",
  name: "Alexandria Smith",
  title: "Experienced Barista & Event Staff",
  location: "12/A, Rathmalana, Dehiwela",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alexandria",
  isAvailable: true,
  stats: {
    jobsCompleted: 42,
    reliability: 98 // percent
  },
  skills: ["Customer Service", "Teamwork", "Event Setup", "Cash Handling", "Coffee Making"],
  aboutMe: "A highly motivated and reliable professional with 5+ years of experience in fast-paced hospitality and event environments. Passionate about providing excellent customer service and contributing to team success. Seeking short-term opportunities to utilize my skills in a dynamic setting.",
  reviewsSummary: {
    averageRating: 4.8,
    totalReviews: 15
  },
  reviews: [
    {
      id: 101,
      name: "James K.",
      role: "Barista at The Coffee House",
      date: "Aug 12, 2025",
      rating: 4,
      text: "Alexandria was a pleasure to work with. Punctual, Professional and great with customers. Highly recommend."
    },
    {
      id: 102,
      name: "Sarah L.",
      role: "Manager at Event Co.",
      date: "July 20, 2025",
      rating: 5,
      text: "Excellent work ethic. Jumped right in and helped organize the chaos. Would hire again in a heartbeat."
    }
  ],
  jobHistory: [
    {
      id: 1,
      name: "James K.",
      role: "The Coffee House",
      date: "13th June 2025"
    },
    {
      id: 2,
      name: "Event Staff",
      role: "Summer Music Festival",
      date: "2nd May 2025"
    },
    {
      id: 3,
      name: "Retail Assistant",
      role: "City Mall Pop-up",
      date: "10th April 2025"
    }
  ]
};

/* -------- Get Profile -------- */
app.get("/user/profile", (req, res) => {
  // In a real app, we'd look up by ID from session/token
  res.json(jobSeekerProfile);
});

/* -------- Start Server -------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
