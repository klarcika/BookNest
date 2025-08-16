import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Povezano na MongoDB (shelves)");
    app.listen(PORT, () => console.log(`Shelves API na: ${PORT}`));
  })
  .catch(err => console.error("Mongo napaka (shelves):", err));
