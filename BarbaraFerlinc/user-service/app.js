const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./router/userRouter');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Routes
app.use('/users', userRouter);

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});