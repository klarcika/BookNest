import Shelves from "../models/shelves.model.js";
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded; // Shranimo decoded podatke (npr. id, email) za kasnejšo uporabo
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };

export const getShelves = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const data = await Shelves.find(filter).lean();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri pridobivanju polic", error: err.message });
  }
};

export const getShelvesById = async (req, res) => {
  try {
    const shelf = await Shelves.findById(req.params.id).lean();
    if (!shelf) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json(shelf);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri pridobivanju polic po ID", error: err.message });
  }
};

export const createShelves = async (req, res) => {
  try {
    const { userId, shelves } = req.body;
    if (!userId) return res.status(400).json({ message: "userId je obvezen" });

    const created = await Shelves.create({ userId, shelves });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri ustvarjanju polic", error: err.message });
  }
};

export const updateShelves = async (req, res) => {
  try {
    const updated = await Shelves.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri posodabljanju polic", error: err.message });
  }
};

export const deleteShelves = async (req, res) => {
  try {
    const deleted = await Shelves.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json({ ok: true, message: "Police izbrisane" });
  } catch (err) {
    res.status(500).json({ message: "Napaka pri brisanju polic", error: err.message });
  }
};


// PUT /shelves/:userId/wantToRead
export const dodajKnjigoVWantToRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId, date } = req.body;
    if (!bookId || !date) {
      return res.status(400).json({ message: "bookId in date sta obvezna" });
    }

    const rezultat = await Shelves.findOneAndUpdate(
      { userId },
      { $push: { "shelves.wantToRead": { bookId, date } } },
      { new: true }
    );

    if (!rezultat) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json(rezultat);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri dodajanju na wantToRead", error: err.message });
  }
};

// PUT /shelves/:userId/reading
export const dodajKnjigoVReading = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId, dateAdded } = req.body;
    if (!bookId || !dateAdded) {
      return res.status(400).json({ message: "bookId in dateAdded sta obvezna" });
    }

    const rezultat = await Shelves.findOneAndUpdate(
      { userId },
      { $push: { "shelves.reading": { bookId, dateAdded } } },
      { new: true }
    );

    if (!rezultat) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json(rezultat);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri dodajanju na reading", error: err.message });
  }
};

// PUT /shelves/:userId/read
export const dodajKnjigoVRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId, dateAdded } = req.body;
    if (!bookId || !dateAdded) {
      return res.status(400).json({ message: "bookId in dateAdded sta obvezna" });
    }

    const rezultat = await Shelves.findOneAndUpdate(
      { userId },
      { $push: { "shelves.read": { bookId, dateAdded } } },
      { new: true }
    );

    if (!rezultat) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json(rezultat);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri dodajanju na read", error: err.message });
  }
};

// POST /shelves/:userId/move
export const premakniKnjigoMedPolicami = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to, bookId, date, dateAdded } = req.body;

    const dovoljene = ["wantToRead", "reading", "read"];
    if (!dovoljene.includes(from) || !dovoljene.includes(to) || from === to) {
      return res.status(400).json({ message: "Neveljavne police 'from' ali 'to'" });
    }
    if (!bookId) return res.status(400).json({ message: "bookId je obvezen" });

    const pullRes = await Shelves.findOneAndUpdate(
      { userId },
      { $pull: { [`shelves.${from}`]: { bookId } } },
      { new: true }
    );
    if (!pullRes) return res.status(404).json({ message: "Police niso najdene" });

    let zapis = { bookId };
    if (to === "wantToRead") {
      if (!date) return res.status(400).json({ message: "Za wantToRead je 'date' obvezen" });
      zapis.date = date;
    } else {
      if (!dateAdded) return res.status(400).json({ message: "Za reading/read je 'dateAdded' obvezen" });
      zapis.dateAdded = dateAdded;
    }

    const pushRes = await Shelves.findOneAndUpdate(
      { userId },
      { $push: { [`shelves.${to}`]: zapis } },
      { new: true }
    );

    res.status(200).json(pushRes);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri premikanju knjige med policami", error: err.message });
  }
};

// DELETE /shelves/:userId/:shelf/:bookId
export const izbrisiKnjigoSPolice = async (req, res) => {
  try {
    const { userId, shelf, bookId } = req.params;
    const dovoljene = ["wantToRead", "reading", "read"];
    if (!dovoljene.includes(shelf)) {
      return res.status(400).json({ message: "Neveljavna polica" });
    }

    const rezultat = await Shelves.findOneAndUpdate(
      { userId },
      { $pull: { [`shelves.${shelf}`]: { bookId } } },
      { new: true }
    );

    if (!rezultat) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json({ ok: true, message: "Knjiga odstranjena", data: rezultat });
  } catch (err) {
    res.status(500).json({ message: "Napaka pri odstranjevanju knjige s police", error: err.message });
  }
};

export const izbrisiShelvesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await Shelves.findOneAndDelete({ userId });
    if (!deleted) return res.status(404).json({ message: "Police niso najdene" });
    res.status(200).json({ ok: true, message: "Police izbrisane po userId" });
  } catch (err) {
    res.status(500).json({ message: "Napaka pri brisanju polic po userId", error: err.message });
  }
};
