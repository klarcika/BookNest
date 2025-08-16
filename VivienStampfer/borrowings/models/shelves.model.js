import mongoose from "mongoose";

const ShelfItemSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  date: { type: Date },      
  dateAdded: { type: Date }   
}, { _id: false });

const ShelvesSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  shelves: {
    wantToRead: { type: [ShelfItemSchema], default: [] },
    reading: { type: [ShelfItemSchema], default: [] },
    read: { type: [ShelfItemSchema], default: [] }
  }
}, { versionKey: false });

export default mongoose.model("Shelves", ShelvesSchema);
