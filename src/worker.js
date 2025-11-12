// src/worker.js
const { exec } = require("child_process");
const { getNextJob, lockJob, updateJobState, incrementAttempts } = require("./jobStore");
const { db } = require("./db");
const { v4: uuidv4 } = require("uuid");

const workerId = uuidv4();

//  Load timeout from config table 
function getJobTimeoutMs() {
  try {
    const row = db.prepare("SELECT value FROM config WHERE key = 'job_timeout_ms'").get();
    return row ? parseInt(row.value) : 10000;
  } catch {
    return 10000;
  }
}

function exponentialBackoff(attempt) {
  const base = 2;
  return Math.pow(base, attempt) * 1000;
}

async function processJob(job) {
  const JOB_TIMEOUT_MS = getJobTimeoutMs();
  console.log(`[Worker ${workerId}] 🏁 Processing job: ${job.id} (${job.command})`);
  lockJob(job.id, workerId);

  const startTime = Date.now();
  let child;
  let stdout = "";
  let stderr = "";

  // Run command + timeout promise
  const execPromise = new Promise((resolve) => {
    child = exec(job.command, (error, out, err) => {
      stdout = out || "";
      stderr = err || "";

      if (error) {
        resolve({ success: false, error });
      } else {
        resolve({ success: true });
      }
    });
  });

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      if (child) {
        child.kill("SIGTERM");
      }
      resolve({ success: false, timeout: true });
    }, JOB_TIMEOUT_MS);
  });

  const result = await Promise.race([execPromise, timeoutPromise]);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  if (!result.success) {
    const attempts = job.attempts + 1;
    await incrementAttempts(job.id);

    if (result.timeout) {
      console.error(`[Worker ${workerId}] ⏱️ Job ${job.id} timed out after ${duration}s`);
      stderr += `\n⏱️ Job timed out after ${JOB_TIMEOUT_MS / 1000}s\n`;
    } else {
      console.error(`[Worker ${workerId}] ❌ Job ${job.id} failed after ${duration}s`);
    }

    if (attempts > job.max_retries) {
      console.error(`[Worker ${workerId}] 💀 Moving job ${job.id} to DLQ`);
      await updateJobState(job.id, "dead", stdout, stderr);
    } else {
      const delay = exponentialBackoff(attempts);
      console.log(`[Worker ${workerId}] 🔁 Retrying in ${delay / 1000}s (attempt ${attempts})`);
      setTimeout(async () => {
        job.attempts = attempts;
        await processJob(job);
      }, delay);
    }
  } else {
    console.log(`[Worker ${workerId}] ✅ Job ${job.id} completed in ${duration}s`);
    await updateJobState(job.id, "completed", stdout, stderr);
  }
}

async function startWorker() {
  console.log(`[Worker ${workerId}] 👷 Worker started...`);
  while (true) {
    const job = await getNextJob();
    if (job) {
      await processJob(job);
    } else {
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

startWorker();
