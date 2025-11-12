
🚀 queuectl — CLI-Based Background Job Queue System

A lightweight Node.js-based background job queue that supports persistent storage, multiple workers, retry with exponential backoff, dead letter queue (DLQ), and job priority handling.
Built entirely using SQLite and Node.js CLI commands.**

A lightweight Node.js-based background job queue that supports persistent storage, multiple workers, retry with exponential backoff, dead letter queue (DLQ), and job priority handling.
Built entirely using SQLite and Node.js CLI commands.


🧰 Tech Stack

Node.js
Commander.js (CLI)
Better-SQLite3 (database)
UUID (unique job IDs)

# 🚀 Start the minimal web dashboard (for monitoring)
node src/server.js

# ⚙️ Start a worker (processes jobs from the queue)
node src/worker.js

# 🧩 Enqueue a new job (add to the queue)
node bin/queuectl.js enqueue "echo 'Hello world!'"

# 📋 List all jobs in the queue (pending, completed, dead, etc.)
node bin/queuectl.js list

# 💀 Show all jobs in the Dead Letter Queue (failed after retries)
node bin/queuectl.js dlq:list

# 🔁 Retry a specific job from the DLQ using its Job ID
node bin/queuectl.js dlq:retry 123e4567-e89b-12d3-a456-426614174000

# 🧼 Clear all jobs from the database (useful for testing)
node bin/queuectl.js reset


🧩 Features

✅ Persistent job storage (SQLite-based)
✅ Multiple worker support
✅ Retry mechanism with exponential backoff
✅ Dead Letter Queue (DLQ)
✅ Priority-based job scheduling (High → Low)
✅ Configuration management
✅ Clean CLI interface
✅ Minimal logging & job tracking


  🏗️ Architecture Overview
queuectl/
├── bin/
│   └── queuectl.js         # CLI entry point
├── src/
│   ├── db.js               # SQLite connection and schema
│   ├── jobStore.js         # Job storage, fetching, updating
│   ├── worker.js           # Worker logic for job execution
│   ├── config.js           # Configuration read/write
│   └── utils.js            # Helper functions (logging, etc.)
├── data/
│   └── queue.db            # SQLite database (auto-created)
├── package.json
└── README.md



🧠 USAGE
⚡ How It Works

Enqueue Command
Adds a job into SQLite with state = pending.
Each job has:

command (string)

priority (integer)

attempts, max_retries, timestamps, etc.

Worker Start
Workers continuously poll the DB, picking the highest-priority pending job.
After successful execution → marked as completed.
On failure → retried using exponential backoff.

DLQ (Dead Letter Queue)
If a job fails more than max_retries, it’s moved to DLQ for manual retry.

Configurable Settings
You can adjust retry timing, poll intervals, and backoff base via CLI.

🌟 Bonus Features Implemented

✅ Job priority queue
✅ Retry mechanism with exponential backoff
✅ Multiple worker support
✅ Dead Letter Queue
✅ Persistent storage
✅ Configuration system
