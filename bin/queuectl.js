const { Command } = require('commander');
const { addJob, getAllJobs } = require('../src/jobStore');
const { startWorker } = require('../src/worker');
const { db } = require('../src/db');
const { getConfig, setConfig, getAllConfig } = require('../src/config');

const program = new Command();

program
  .name('queuectl')
  .description('CLI-based background job queue system')
  .version('1.2.0');

// ye method hai command enqueue karne ke liye jisme priority di gyi hogi
program
  .command('enqueue')
  .argument('<command>', 'Command to run')
  .option('--priority <n>', 'Job priority (1-10)', '5')
  .description('Add a new job to the queue')
  .action((command, opts) => {
    const priority = parseInt(opts.priority);
    const id = addJob(command, 3, priority);
    console.log(` Job enqueued with ID: ${id} and priority: ${priority}`);
  });


// ye method hai worker function ko start karne ke liye 
program
  .command('worker:start')
  .description('Start a worker to process jobs')
  .option('--count <n>', 'Number of workers', '1')
  .action((opts) => {
    const count = parseInt(opts.count);
    for (let i = 0; i < count; i++) {
      startWorker();
    }
  });

// ye method hai sari jobs ko view karne ke liye
program
  .command('list')
  .option('--state <state>', 'Filter by state (pending, completed, failed, dead)')
  .description('List jobs by state')
  .action((opts) => {
    const jobs = getAllJobs();
    const filtered = opts.state ? jobs.filter(j => j.state === opts.state) : jobs;
    console.table(filtered);
  });

// ye method hai jo jobs dead ho jati hai wo dlq me aati hai unko dekhne ke liye
program
  .command('dlq:list')
  .description('List all jobs in the Dead Letter Queue')
  .action(() => {
    const { getDLQJobs } = require('../src/jobStore');
    const jobs = getDLQJobs();
    if (jobs.length === 0) {
      console.log(' DLQ is empty');
    } else {
      console.table(jobs);
    }
  });

// ye method dead jobd ko fir se run karne ke liye 
program
  .command('dlq:retry')
  .argument('<id>', 'Job ID to retry')
  .description('Retry a job from the Dead Letter Queue')
  .action((id) => {
    const { retryDLQJob } = require('../src/jobStore');
    retryDLQJob(id);
    console.log(` Job ${id} moved back to pending queue`);
  });

// is method se db ko rest krte hai
program
  .command('reset')
  .description('Reset all jobs (for testing)')
  .action(() => {
    db.prepare('DELETE FROM jobs').run();
    console.log('  All jobs cleared.');
  });

// Config commands
const config = program.command('config').description('Manage queue configuration');

config
  .command('set')
  .argument('<key>')
  .argument('<value>')
  .description('Set a configuration key-value pair')
  .action((key, value) => {
    setConfig(key, value);
    console.log(` Config updated: ${key} = ${value}`);
  });

config
  .command('list')
  .description('List all configuration settings')
  .action(() => {
    const all = getAllConfig();
    console.table(all);
  });

program.parse(process.argv);
