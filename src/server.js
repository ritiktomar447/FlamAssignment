// src/server.js
const express = require("express");
const path = require("path");
const { getAllJobs, getDLQJobs, retryDLQJob } = require("./jobStore");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Get all jobs
app.get("/api/jobs", (req, res) => {
  res.json(getAllJobs());
});

// Get DLQ jobs
app.get("/api/dlq", (req, res) => {
  res.json(getDLQJobs());
});

// Retry DLQ job
app.post("/api/dlq/retry/:id", (req, res) => {
  retryDLQJob(req.params.id);
  res.json({ message: `♻️ Job ${req.params.id} retried successfully` });
});

// --- 🧠 NEW: Stats route ---
app.get("/api/stats", (req, res) => {
  const jobs = getAllJobs();
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.state === "pending").length,
    processing: jobs.filter(j => j.state === "processing").length,
    completed: jobs.filter(j => j.state === "completed").length,
    dead: jobs.filter(j => j.state === "dead").length,
    workers: 1 
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`✅ Dashboard running at http://localhost:${PORT}`);
});
