// src/db.js
const Database = require('better-sqlite3');
const path = require('path');

// Database file ka path (data/queue.db)
const dbPath = path.resolve(__dirname, '../data/queue.db');

// Database connection
const db = new Database(dbPath);

// Schema setup (tables create agar exist nahi karti)
db.exec(`
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  command TEXT NOT NULL,
  state TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 2, -- 🆕 Default Medium Priority
  created_at TEXT,
  updated_at TEXT,
  available_at TEXT,
  locked_by TEXT,
  locked_at TEXT,
  stdout TEXT,
  stderr TEXT
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

// Default config values 
const getConfig = db.prepare('SELECT value FROM config WHERE key = ?');
const insertConfig = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
if (!getConfig.get('backoff_base')) insertConfig.run('backoff_base', '2');
if (!getConfig.get('worker_poll_interval_ms')) insertConfig.run('worker_poll_interval_ms', '1000');

module.exports = {
  db
};
