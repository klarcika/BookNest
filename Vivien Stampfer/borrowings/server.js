import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Povezano na MongoDB (izposoja)");
    app.listen(PORT, () => console.log(`Izposoja API: http://localhost:${PORT}`));
  })
  .catch(err => console.error("Mongo napaka (izposoja):", err));
