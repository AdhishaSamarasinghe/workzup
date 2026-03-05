const express = require("express");
const cors = require("cors");
const preferencesRoutes = require("./routes/preferences");
const recruitersRoutes = require("./routes/recruiters");

const app = express();
let PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, port: PORT }));

app.use("/preferences", preferencesRoutes);
app.use("/recruiters", recruitersRoutes);

app.get("/", (req, res) => {
  res.send(`Workzup Backend API is running on port ${PORT}`);
});

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    PORT = portToTry;
    console.log(`Backend running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (portToTry === 5000) {
        console.warn(`Port 5000 is in use, falling back to 5001...`);
        startServer(5001);
      } else {
        console.error(
          `Port ${portToTry} is also in use. Could not start server.`,
        );
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(PORT);
