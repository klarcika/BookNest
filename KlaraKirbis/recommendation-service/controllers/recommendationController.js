const Recommendation = require('../models/recommendationModel');

// ===== GET =====
exports.getRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        let recs = await Recommendation.findOne({ userId }).populate('recommendedBooks');
        if (!recs) {
            recs = await Recommendation.create({ userId, recommendedBooks: [] });
        }
        res.status(200).json(recs);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri pridobivanju priporočil.', error });
    }
};

exports.getAllRecommendations = async (req, res) => {
    try {
        const recs = await Recommendation.find().populate('recommendedBooks');
        res.status(200).json(recs);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri pridobivanju vseh priporočil.', error });
    }
};

// ===== POST =====
exports.createRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { recommendedBooks } = req.body;

        const newRec = await Recommendation.create({
            userId,
            recommendedBooks,
            generatedAt: new Date()
        });

        res.status(201).json(newRec);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri ustvarjanju priporočil.', error });
    }
};

exports.addBookToRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const { bookId } = req.body;

        const rec = await Recommendation.findOneAndUpdate(
            { userId },
            { $addToSet: { recommendedBooks: bookId } },
            { new: true, upsert: true }
        );

        res.status(200).json(rec);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri dodajanju knjige v priporočila.', error });
    }
};

// ===== PUT =====
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

exports.updateSingleRecommendation = async (req, res) => {
    try {
        const { userId, bookId } = req.params;
        const { newBookId } = req.body; // primer: zamenja knjigo

        const rec = await Recommendation.findOne({ userId });
        if (!rec) return res.status(404).json({ message: 'Priporočila niso najdena.' });

        const index = rec.recommendedBooks.indexOf(bookId);
        if (index === -1) return res.status(404).json({ message: 'Knjiga ni v priporočilih.' });

        rec.recommendedBooks[index] = newBookId;
        await rec.save();

        res.status(200).json(rec);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri posodabljanju knjige v priporočilih.', error });
    }
};

// ===== DELETE =====
exports.deleteRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await Recommendation.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Vsa priporočila za uporabnika izbrisana.' });
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri brisanju priporočil.', error });
    }
};

exports.deleteSingleRecommendation = async (req, res) => {
    try {
        const { userId, bookId } = req.params;
        const rec = await Recommendation.findOneAndUpdate(
            { userId },
            { $pull: { recommendedBooks: bookId } },
            { new: true }
        );
        res.status(200).json(rec);
    } catch (error) {
        res.status(500).json({ message: 'Napaka pri brisanju knjige iz priporočil.', error });
    }
};
