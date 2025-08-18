import Obvestilo from "../models/obvestilo.model.js";
import jwt from 'jsonwebtoken';

const STATISTICS_API_URL = process.env.STATISTICS_API_URL || "http://backend-statistics:3004";
const QUOTE_API_URL = process.env.QUOTE_API_URL;
const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

export const seznamObvestil = async (req, res) => {
  try {
    const uporabnikId = req.user.id; // uporabnik iz JWT
    const vrstice = await Obvestilo.find({ uporabnikId }).sort({ datumUstvarjeno: -1 }).lean();
    res.status(200).json(vrstice);
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri pridobivanju obvestil", napaka: err.message });
  }
};

export const enoObvestilo = async (req, res) => {
  try {
    const obvestilo = await Obvestilo.findById(req.params.id).lean();
    if (!obvestilo) return res.status(404).json({ sporocilo: "Ni najdeno" });
    res.status(200).json(obvestilo);
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri pridobivanju obvestila", napaka: err.message });
  }
};

export const dodajObvestilo = async (req, res) => {
  try {
    const { uporabnikId, tip, status, knjigaId, izzivId, podatki } = req.body;
    if (!uporabnikId || !tip) {
      return res.status(400).json({ sporocilo: "Polja uporabnikId in tip so obvezna" });
    }
    let vsebina = {};
    if (tip === "novaKnjiga") {
      if (!knjigaId || !podatki?.naslovKnjige || !podatki?.avtor) {
        return res.status(400).json({ sporocilo: "Za tip novaKnjiga so obvezni knjigaId, naslovKnjige in avtor" });
      }
      let citat = null;
      try {
        const r = await fetch(QUOTE_API_URL);
        if (r.ok) {
          const json = await r.json();
          citat = json.quote;
        }
      } catch (e) {
        console.error("Napaka pri pridobivanju citata:", e.message);
      }
      vsebina = {
        knjigaId,
        naslovKnjige: podatki.naslovKnjige,
        avtor: podatki.avtor,
        sporocilo: `Dodana je nova knjiga: ${podatki.naslovKnjige}`,
        citat
      };
    }
    if (tip === "recenzijaPrijatelja") {
      if (!knjigaId || !podatki?.prijatelj || !podatki?.naslovKnjige || !podatki?.ocena) {
        return res.status(400).json({ sporocilo: "Za tip recenzijaPrijatelja so obvezni knjigaId, prijatelj, naslovKnjige in ocena" });
      }
      vsebina = {
        knjigaId,
        prijatelj: podatki.prijatelj,
        naslovKnjige: podatki.naslovKnjige,
        ocena: podatki.ocena,
        sporocilo: `${podatki.prijatelj} je dodal novo recenzijo za ${podatki.naslovKnjige}`
      };
    }
    if (tip === "bralniIzziv") {
      if (!izzivId || !podatki?.nazivIzziva || !podatki?.status) {
        return res.status(400).json({ sporocilo: "Za tip bralniIzziv so obvezni izzivId, nazivIzziva in status" });
      }

      let targetBooks = null;
      let completedBooks = null;
      let citat = null;

      try {
        const r = await fetch(`${STATISTICS_API_URL}/goals/user/${uporabnikId}`);
        if (r.ok) {
          const json = await r.json();
          targetBooks = json?.data?.targetBooks ?? null;
          completedBooks = json?.data?.completedBooks ?? null;
        }
      } catch (e) {
        console.error("Napaka pri pridobivanju podatkov iz statistics:", e.message);
      }

      try {
        const r = await fetch(QUOTE_API_URL);
        if (r.ok) {
          const json = await r.json();
          citat = json.quote;
        }
      } catch (e) {
        console.error("Napaka pri pridobivanju citata:", e.message);
      }

      vsebina = {
        izzivId,
        nazivIzziva: podatki.nazivIzziva,
        status: podatki.status,
        targetBooks,
        completedBooks,
        sporocilo: `Rok za dokončanje izziva "${podatki.nazivIzziva}" se izteče kmalu`,
        citat
      };
    }

    const novo = await Obvestilo.create({ uporabnikId, tip, knjigaId, izzivId, vsebina, status });
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri ustvarjanju obvestila", napaka: err.message });
  }
};

export const posodobiObvestilo = async (req, res) => {
  try {
    const spremembe = req.body;
    const posodobljeno = await Obvestilo.findByIdAndUpdate(req.params.id, { $set: spremembe }, { new: true, runValidators: true });
    if (!posodobljeno) return res.status(404).json({ sporocilo: "Ni najdeno" });
    res.status(200).json(posodobljeno);
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri posodabljanju obvestila", napaka: err.message });
  }
};

export const izbrisiObvestilo = async (req, res) => {
  try {
    const izbrisano = await Obvestilo.findByIdAndDelete(req.params.id);
    if (!izbrisano) return res.status(404).json({ sporocilo: "Ni najdeno" });
    res.status(200).json({ ok: true, sporocilo: "Obvestilo izbrisano" });
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri brisanju obvestila", napaka: err.message });
  }
};
export const izbrisiVsaZaUporabnika = async (req, res) => {
  try {
    const { uporabnikId } = req.params;
    if (!uporabnikId) {
      return res.status(400).json({ sporocilo: "Manjka uporabnikId" });
    }
    const r = await Obvestilo.deleteMany({ uporabnikId });
    res.status(200).json({ ok: true, izbrisano: r.deletedCount });
  } catch (err) {
    res.status(500).json({ sporocilo: "Napaka pri brisanju", napaka: err.message });
  }
};
