/* Local development entry point. On Vercel the platform imports server.js
   as a serverless handler, so server.js must not listen. Here we do. */
require('dotenv').config();
const app = require('./server');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
