const Recommendation = require('../model/recommendation');

// GET /recommendations/:userId - Get personalized recommendations
const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await Recommendation.find({ userId }).sort({ rank: -1 });
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recommendations' });
  }
};

// GET /recommendations/popular - Get popular books
const getPopularBooks = async (req, res) => {
  try {
    const popular = await Recommendation.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json(popular);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching popular books' });
  }
};

// POST /recommendations - Add a new recommendation
const addRecommendation = async (req, res) => {
  try {
    const { userId, bookId, rank } = req.body;
    if (!userId || !bookId) {
      return res.status(400).json({ error: 'userId and bookId are required' });
    }
    const recommendation = new Recommendation({ userId, bookId, rank });
    await recommendation.save();
    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Error adding recommendation' });
  }
};

// POST /recommendations/bulk - Add multiple recommendations
const addBulkRecommendations = async (req, res) => {
  try {
    const recommendations = req.body;
    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }
    const inserted = await Recommendation.insertMany(recommendations);
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Error adding bulk recommendations' });
  }
};

// PUT /recommendations/:id - Update a recommendation
const updateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const recommendation = await Recommendation.findByIdAndUpdate(id, updates, { new: true });
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.status(200).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Error updating recommendation' });
  }
};

// PUT /recommendations/:id/rank - Update recommendation rank
const updateRecommendationRank = async (req, res) => {
  try {
    const { id } = req.params;
    const { rank } = req.body;
    if (typeof rank !== 'number') {
      return res.status(400).json({ error: 'Rank must be a number' });
    }
    const recommendation = await Recommendation.findByIdAndUpdate(
      id,
      { rank },
      { new: true }
    );
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.status(200).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Error updating rank' });
  }
};

// DELETE /recommendations/:id - Delete a recommendation
const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await Recommendation.findByIdAndDelete(id);
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.status(200).json({ message: 'Recommendation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting recommendation' });
  }
};

// DELETE /recommendations/bulk - Delete multiple recommendations
const deleteBulkRecommendations = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Request body must be an array of IDs' });
    }
    const result = await Recommendation.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: `${result.deletedCount} recommendations deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting bulk recommendations' });
  }
};

module.exports = {
  getRecommendations,
  getPopularBooks,
  addRecommendation,
  addBulkRecommendations,
  updateRecommendation,
  updateRecommendationRank,
  deleteRecommendation,
  deleteBulkRecommendations,
};