// models/recommendationModel.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    recommendedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
