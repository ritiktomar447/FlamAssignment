# 🚀 QueueCTL — CLI-Based Background Job Queue System

QueueCTL is a lightweight Node.js-based background job queue system designed for developers and teams who need reliable, persistent, and manageable background job execution. It supports multiple workers, retry with exponential backoff, dead letter queue (DLQ), and job priority handling, all via a simple CLI interface.

# 🧰 Tech Stack

Node.js — core runtime

Commander.js — CLI interface

UUID — unique job IDs

# File-based JSON storage — persistent job storage
⚡ Quick Start
# Start a worker
node bin/queuectl.js worker:start --count 1

# Enqueue a new job
node bin/queuectl.js enqueue "echo 'Hello World!'"

# Check queue status
node bin/queuectl.js status

# List jobs
node bin/queuectl.js list pending
node bin/queuectl.js list completed
node bin/queuectl.js list failed
node bin/queuectl.js list dead

# Dead Letter Queue (DLQ)
# List all DLQ jobs
node bin/queuectl.js dlq:list

# Retry a specific job from DLQ using its Job ID
node bin/queuectl.js dlq:retry <job-id>

# Reset all jobs (for testing)
node bin/queuectl.js reset

# 🧩 Features

✅ Persistent job storage (JSON-based)
✅ Multiple worker support (parallel job processing)
✅ Retry mechanism with exponential backoff
✅ Dead Letter Queue (DLQ) for failed jobs
✅ Job priority scheduling (High → Low)
✅ Configurable retry/backoff intervals via CLI or config file
✅ Minimal logging & job tracking
✅ Clean, developer-friendly CLI

# 🏗️ Architecture Overview
queuectl/
├── bin/
│   └── queuectl.js        # CLI entry point
├── src/
│   ├── worker.js          # Worker logic for job execution
│   ├── queueManager.js    # Job storage, fetching, updating
│   ├── storage.js         # File-based persistence
│   ├── config.js          # Configuration read/write
│   └── utils.js           # Helper functions (logging, UUID, etc.)
├── data/
│   ├── jobs.json          # Pending/processed jobs
│   └── dlq.json           # Dead Letter Queue jobs
├── package.json
└── README.md

# 🌟 Bonus / Pro Features

✅ Job priority queue
✅ Configurable retry & backoff
✅ Persistent storage across restarts
✅ Multi-worker support for high throughput
✅ Dead Letter Queue for safe job failure management

# 🔗 Demo
https://drive.google.com/file/d/1lqrU8E24gGeJkd_Ydamj8cvi0Pf0JdQn/view?usp=sharing
