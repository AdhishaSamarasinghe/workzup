const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const recruiterRoutes = require("./routes/recruiter");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/recruiter", recruiterRoutes);

// Root Endpoint
app.use("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
