const mongoose = require('mongoose');

async function connectDB() {
  // Local MongoDB by default; override with MONGODB_URI (backend/.env or shell).
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-parser';

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
