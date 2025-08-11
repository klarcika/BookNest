import Obvestilo from "../models/obvestilo.model.js";

export const seznamObvestil = async (req, res) => {
  const { uporabnikId, status, tip } = req.query;
  const q = {};
  if (uporabnikId) q.uporabnikId = uporabnikId;
  if (status) q.status = status;
  if (tip) q.tip = tip;
  const vrstice = await Obvestilo.find(q).sort({ datumUstvarjeno: -1 }).lean();
  res.json(vrstice);
};

export const enoObvestilo = async (req, res) => {
  const obvestilo = await Obvestilo.findById(req.params.id).lean();
  if (!obvestilo) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json(obvestilo);
};

export const dodajObvestilo = async (req, res) => {
  const { uporabnikId, tip, vsebina, status } = req.body;
  if (!uporabnikId || !tip) {
    return res.status(400).json({ sporocilo: "Polja uporabnikId in tip so obvezna" });
  }
  const novo = await Obvestilo.create({ uporabnikId, tip, vsebina, status });
  res.status(201).json(novo);
};

export const posodobiObvestilo = async (req, res) => {
  const spremembe = req.body;
  const posodobljeno = await Obvestilo.findByIdAndUpdate(req.params.id, { $set: spremembe }, { new: true });
  if (!posodobljeno) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json(posodobljeno);
};

export const izbrisiObvestilo = async (req, res) => {
  const izbrisano = await Obvestilo.findByIdAndDelete(req.params.id);
  if (!izbrisano) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json({ ok: true });
};
