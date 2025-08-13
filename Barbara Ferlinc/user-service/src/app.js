const express = require("express");

require('dotenv').config();

const userRouter = require('./route/userRouter');

const app = express();

app.use(express.json());

app.use('/user/', userRouter);

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});