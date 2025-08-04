// recommendation-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const recommendationRoutes = require('./routes/recommendationRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected to recommendation-service'))
    .catch(err => console.error(err));

app.use('/api/recommendations', recommendationRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Recommendation service running on port ${PORT}`));
