// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const CalculateStudentTestResult = require('../modules/calculation_result/calculation_result.helper');

const studentId = process.argv[2];

mongoose
  .connect('mongodb://localhost:27017/module', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    await CalculateStudentTestResult(studentId);
    console.log('Calculation done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
