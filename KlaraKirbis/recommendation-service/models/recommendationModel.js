const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.String, required: true, unique: true },
    recommendedBooks: [
        {
            bookId: { type: mongoose.Schema.Types.String, required: true, ref: 'Book' },
            reason: { type: String }
        }
    ],
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
