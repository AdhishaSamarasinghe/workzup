const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("Workzup API running ✅"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/onboarding", require("./routes/onboarding"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ API listening on ${PORT}`));
