const express = require("express");

require('dotenv').config();


const messageRouter = require('./router/messageRouter');

const app = express();

app.use(express.json());

app.use('/message/', messageRouter);

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});