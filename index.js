const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/module', {
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

