import mongoose from "mongoose";

const IzposojaSchema = new mongoose.Schema({
  uporabnikId: { type: String, required: true, index: true },
  knjigaId:    { type: String, required: true, index: true },
  datumIzposoje: { type: Date, default: Date.now },
  rokVrnitve:  { type: Date, required: true, index: true },
  datumVracila: { type: Date },
  status:      { type: String, enum: ["AKTIVNA","VRNJENA","PREKLICANA","ZAMUDA"], default: "AKTIVNA", index: true },
  steviloPodaljsanj: { type: Number, default: 0 }
}, { versionKey: false });

export default mongoose.model("Izposoja", IzposojaSchema);
