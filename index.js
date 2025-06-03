const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// *************** Connection to mongodb
mongoose.connect('mongodb://localhost:27017/module')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
