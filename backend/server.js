const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* -------- Temporary Job Storage -------- */
let jobs = [
  {
    id: 1,
    title: "Event Staff",
    company: "Innovate Events",
    description: "Assist with guest check-in.",
    location: "Colombo",
    pay: "$20/hr",
    date: "2026-02-10",
  },
];

/* -------- Get Jobs -------- */
app.get("/jobs", (req, res) => {
  res.json(jobs);
});

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

/* -------- Start Server -------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
