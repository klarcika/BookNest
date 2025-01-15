const express = require('express');
const { getRecommendations } = require('../controllers/messageController');

const router = express.Router();

router.get('/message/:userId', getRecommendations);

module.exports = router;
