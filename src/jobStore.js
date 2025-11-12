// src/jobStore.js
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// ✅ Job insert karne ke liye
function addJob(command, maxRetries = 3, priority = 5) {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO jobs (id, command, state, created_at, updated_at, max_retries, available_at, priority)
    VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)
  `);
  stmt.run(id, command, createdAt, createdAt, maxRetries, createdAt, priority);
  return id;
}


// ✅ Next job fetch karne ke liye (priority wise)
function getNextJob() {
  const stmt = db.prepare(`
    SELECT * FROM jobs
    WHERE state = 'pending'
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
  `);
  return stmt.get();
}

// Job update karne ke liye
function updateJobState(id, newState, stdout = '', stderr = '') {
  const stmt = db.prepare(`
    UPDATE jobs
    SET state = ?, updated_at = ?, stdout = ?, stderr = ?
    WHERE id = ?
  `);
  stmt.run(newState, new Date().toISOString(), stdout, stderr, id);
}

// Job ko lock karne ke liye
function lockJob(id, workerId) {
  const stmt = db.prepare(`
    UPDATE jobs
    SET locked_by = ?, locked_at = ?, state = 'processing'
    WHERE id = ?
  `);
  stmt.run(workerId, new Date().toISOString(), id);
}

// Retry count badhane ke liye
function incrementAttempts(id) {
  const stmt = db.prepare(`UPDATE jobs SET attempts = attempts + 1 WHERE id = ?`);
  stmt.run(id);
}

// Sare jobs read karne ke liye
function getAllJobs() {
  const stmt = db.prepare('SELECT * FROM jobs ORDER BY priority DESC, created_at DESC');
  return stmt.all();
}

// DLQ related functions
function getDLQJobs() {
  const stmt = db.prepare("SELECT * FROM jobs WHERE state = 'dead' ORDER BY updated_at DESC");
  return stmt.all();
}

function retryDLQJob(id) {
  const stmt = db.prepare(`
    UPDATE jobs
    SET state = 'pending', attempts = 0, updated_at = ?
    WHERE id = ? AND state = 'dead'
  `);
  stmt.run(new Date().toISOString(), id);
}

module.exports = {
  addJob,
  getNextJob,
  updateJobState,
  lockJob,
  incrementAttempts,
  getAllJobs,
  getDLQJobs,
  retryDLQJob
};
