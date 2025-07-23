const { spawn } = require('child_process');

function triggerCalculation(studentId) {
  const child = spawn('node', ['calculate/worker.js', studentId]);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

// Contoh pemakaian
triggerCalculation('5f6c2b1234567890abcdef12');
