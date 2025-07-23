const { Worker } = require('worker_threads');
const path = require('path');

function runStudentCalculationInWorker(studentId) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.resolve(__dirname, '../workers/student_test_result.worker.js'),
      {
        workerData: { studentId },
      }
    );

    worker.on('message', (message) => {
      if (message.success) {
        resolve('Calculation completed');
      } else {
        reject(new Error(`Worker failed: ${message.error}`));
      }
    });

    worker.on('error', (err) => {
      reject(new Error(`Worker crashed: ${err.message}`));
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
