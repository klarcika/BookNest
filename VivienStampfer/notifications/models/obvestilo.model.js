import mongoose from "mongoose";

const ObvestiloSchema = new mongoose.Schema({
  uporabnikId: { type: String, index: true },
  tip:         { type: String, enum: ["novaKnjiga", "recenzijaPrijatelja", "bralniIzziv"], required: true, index: true },
  knjigaId:   { type: String },
  izzivId:    { type: String },
  vsebina:     { type: Object, default: {} },
  status:      { type: String, enum: ["vrsta","poslano","napaka","prebrano"], default: "vrsta", index: true },
  napaka:      { type: String },
  datumUstvarjeno: { type: Date, default: Date.now },
  datumPoslano:    { type: Date }
}, { versionKey: false });

export default mongoose.model("Obvestilo", ObvestiloSchema, "obvestila");
