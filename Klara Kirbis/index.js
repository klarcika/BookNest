const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const recommendationRouter = require('./router/messageRouter');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/recommendations', recommendationRouter);

// Start Server
app.listen(port, () => {
  console.log(`Recommendations service running on port ${port}`);
});