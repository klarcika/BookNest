import Shelves from "../models/shelves.model.js";
import jwt from 'jsonwebtoken';
const BOOKS_API_URL = process.env.BOOKS_API_URL || "http://localhost:3032";
const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
};

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
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: "bookId je obvezen" });
    }

    const date = new Date().toJSON();

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
export const getReadBooksForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await Shelves.findOne({ userId }).lean();
    if (!doc) return res.status(404).json({ message: "Police niso najdene" });

    const readItems = doc.shelves?.read || [];

    if (readItems.length === 0) {
      return res.status(404).json({ message: "Na polici 'read' ni knjig" });
    }

    const results = await Promise.all(
      readItems.map(async (it) => {
        try {
          const r = await fetch(`${BOOKS_API_URL}/books/${it.bookId}`);
          if (!r.ok) throw new Error("Ni najdeno");
          const book = await r.json();
          return { ...book, dateAdded: it.dateAdded };
        } catch {
          return null;
        }
      })
    );

    const found = results.filter(Boolean);
    if (found.length === 0) {
      return res.status(404).json({ message: "Knjige v read niso najdene iz book-service" });
    }

    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
