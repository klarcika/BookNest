// controllers/recommendationController.js
const Recommendation = require('../models/recommendationModel');

// Dummy priporočilo – nadomesti z algoritmom
exports.getRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        let recs = await Recommendation.findOne({ userId }).populate('recommendedBooks');
        if (!recs) {
            // Simulacija praznega priporočila
            recs = await Recommendation.create({ userId, recommendedBooks: [] });
        }

        res.status(200).json(recs);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri pridobivanju priporočil.', error });
    }
};

exports.updateRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const { recommendedBooks } = req.body;

        const updated = await Recommendation.findOneAndUpdate(
            { userId },
            { recommendedBooks, generatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri posodabljanju priporočil.', error });
    }
};
