const { ObjectId } = require('mongodb');
const db = require('../db');

class Book {
    static async add() {
        try {
            const newBook = {
                id: ObjectId
            };

            db.collection("Books").insertOne(newBook);
            return { message: 'Book successfully added', book: newBook };
        } catch (error) {
            throw new Error('Error inserting book into database: ' + error.message);
        }
    }

    static async all() {
        try {
            const books = await db.collection("Books").find().toArray();

            return books;
        } catch (error) {
            throw new Error('Error retrieving books from database: ' + error.message);
        }
    }

    static async getById(id) {
        try {
            const book = await db.collection("Books").findOne(
                { _id: new ObjectId(id) }
            );

            return book;
        } catch (error) {
            throw new Error('Error retrieving book from database: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const result = await db.collection("Books").deleteOne(
                { _id: new ObjectId(id) }
            );

            return { message: 'Book deleted', result: result };
        } catch (error) {
            throw new Error('Error deleting book from database: ' + error.message);
        }
    }
}

module.exports = Book;