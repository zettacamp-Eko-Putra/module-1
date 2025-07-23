const { spawn } = require('child_process');
const path = require('path');

function runStudentCalculationInWorker(studentId) {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(
      __dirname,
      '../worker/calculation.worker.js'
    );

    const child = spawn('node', [workerPath, studentId]);

    child.stdout.on('data', (data) => {
      console.log(`[Worker] ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[Worker Error] ${data}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

module.exports = runStudentCalculationInWorker;
