import cluster from 'cluster';
import { cpus } from 'os';
import process from 'process';
import { resolve } from 'path';
import { server } from './server.js';
import dotenv from 'dotenv';

dotenv.config({path: resolve((process.cwd(), '.env'))});

const PORT = process.env.PORT || 4000;
const pid = process.pid;
let workers = [];

if (cluster.isPrimary) {
  const numCPUs = cpus().length;
  console.log(`Master pid: ${pid}`);
  console.log(`Starting ${numCPUs} forks`);
  for (let i = 0; i < numCPUs; i++) {
      workers[i] = cluster.fork();
  }
  workers.forEach((worker) => {
      worker.on('listening', () => {
          worker.send('shutdown');
          worker.disconnect();
          worker.kill();
      });

      worker.on('disconnect', () => {

      });
  });
} else {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  console.log(`Worker: ${pid}, port: ${PORT}`);

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      console.log('shutdown');
    }
  });
};

workers.forEach((worker) => {
    worker.on('exit', (code, signal) => {
      if (signal) {
        console.log(`worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        console.log(`worker exited with error code: ${code}`);
      } else {
        console.log('worker success!');
      }
    });
});

process.on('uncaughtException', () => {
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});

process.once('exit', () => process.exit(0));
process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
process.on('message', message => {
  if (message === 'shutdown') {
      process.exit(0);
  }
});
