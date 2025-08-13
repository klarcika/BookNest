import Izposoja from "../models/izposoja.model.js";

export const seznamIzposoj = async (req, res) => {
  const { uporabnikId, status } = req.query;
  const q = {};
  if (uporabnikId) q.uporabnikId = uporabnikId;
  if (status) q.status = status;
  const vrstice = await Izposoja.find(q).sort({ datumIzposoje: -1 }).lean();
  res.json(vrstice);
};

export const enaIzposoja = async (req, res) => {
  const izposoja = await Izposoja.findById(req.params.id).lean();
  if (!izposoja) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json(izposoja);
};

export const dodajIzposojo = async (req, res) => {
  const { uporabnikId, knjigaId, rokVrnitve } = req.body;
  if (!uporabnikId || !knjigaId || !rokVrnitve) {
    return res.status(400).json({ sporocilo: "Polja uporabnikId, knjigaId in rokVrnitve so obvezna" });
  }
  const nova = await Izposoja.create({ uporabnikId, knjigaId, rokVrnitve });
  res.status(201).json(nova);
};

export const posodobiIzposojo = async (req, res) => {
  const spremembe = req.body;
  const posodobljena = await Izposoja.findByIdAndUpdate(req.params.id, { $set: spremembe }, { new: true });
  if (!posodobljena) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json(posodobljena);
};

export const izbrisiIzposojo = async (req, res) => {
  const izbrisana = await Izposoja.findByIdAndDelete(req.params.id);
  if (!izbrisana) return res.status(404).json({ sporocilo: "Ni najdeno" });
  res.json({ ok: true });
};
