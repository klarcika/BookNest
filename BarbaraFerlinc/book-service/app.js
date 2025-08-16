const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const bookRouter = require('./router/bookRouter');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use('/books/', bookRouter);

const port = process.env.PORT || 3032;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});