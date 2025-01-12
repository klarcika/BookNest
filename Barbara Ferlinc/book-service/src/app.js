const express = require("express");

require('dotenv').config();

const bookRouter = require('./router/bookRouter');

const app = express();

app.use(express.json());

app.use('/book/', bookRouter);

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});