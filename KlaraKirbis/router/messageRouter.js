const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  getRecommendations,
  getPopularBooks,
  addRecommendation,
  addBulkRecommendations,
  updateRecommendation,
  updateRecommendationRank,
  deleteRecommendation,
  deleteBulkRecommendations,
} = require('../controller/messageController');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
router.get('/:userId', authenticateJWT, getRecommendations); // GET /recommendations/:userId
router.get('/popular', getPopularBooks); // GET /recommendations/popular
router.post('/', authenticateJWT, addRecommendation); // POST /recommendations
router.post('/bulk', authenticateJWT, addBulkRecommendations); // POST /recommendations/bulk
router.put('/:id', authenticateJWT, updateRecommendation); // PUT /recommendations/:id
router.put('/:id/rank', authenticateJWT, updateRecommendationRank); // PUT /recommendations/:id/rank
router.delete('/:id', authenticateJWT, deleteRecommendation); // DELETE /recommendations/:id
router.delete('/bulk', authenticateJWT, deleteBulkRecommendations); // DELETE /recommendations/bulk

module.exports = router;