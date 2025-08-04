// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendationController');

router.get('/:userId', controller.getRecommendationsForUser);
router.put('/:userId', controller.updateRecommendations);

module.exports = router;
