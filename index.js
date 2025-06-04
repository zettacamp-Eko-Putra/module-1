
// *************** IMPORT CORE ***************
const express = require('express');
const mongoose = require('mongoose');

// *************** Configuration ***************
const app = express();
const port = 3000;


// *************** Connection express ***************
app.get('/', (req, res) => {
  res.send('Server is running');
});


// *************** START: Server listening ***************
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// *************** END: server listening ***************


// *************** Connection to mongodb ***************
mongoose.connect('mongodb://localhost:27017/module')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
