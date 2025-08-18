const db = require('../db');
require('dotenv').config();

const reviewsApi = process.env.REVIEWS_API_URL || 'http://localhost:3002';

class Book {
    static async add(
        title,
        author,
        genres,
        publishedYear,
        isbn,
        description,
        coverUrl,
        averageRating,
        ratingsCount,
        pages
    ) {
        try {
            const date = new Date().toJSON();
            const id = title.toLowerCase().replace(/\s+/g, '') + "_" + date.replace(/[:.]/g, '-');
            const newBook = {
                _id: id,
                title: title,
                author: author,
                genres: genres,
                publishedYear: publishedYear,
                isbn: isbn,
                description: description,
                coverUrl: coverUrl,
                createdAt: date.replace(/[:.]/g, '-'),
                averageRating: averageRating,
                ratingsCount: ratingsCount,
                pages: pages,
            };

            db.collection("Books").doc(id).set(newBook);
            return { message: 'Book successfully added', book: newBook };
        } catch (error) {
            throw new Error('Error inserting book into database: ' + error.message);
        }
    }

    static async addMultiple(books) {
        try {
            const date = new Date().toJSON();
            const batch = db.batch();

            books.forEach(book => {
                const id = book.title.toLowerCase().replace(/\s+/g, '') + "_" + date.replace(/[:.]/g, '-');
                const bookData = { ...book, createdAt: date.replace(/[:.]/g, '-'), updatedAt: date.replace(/[:.]/g, '-'), _id: id };
                const docRef = db.collection("Books").doc(id);
                batch.set(docRef, bookData);
            });

            await batch.commit();
            return { message: `${books.length} books successfully added` };
        } catch (error) {
            throw new Error('Error inserting multiple books into database: ' + error.message);
        }
    }

    static async all() {
        try {
            const booksRef = db.collection("Books");
            const response = await booksRef.get();
            const books = [];
            response.forEach((doc) => {
                books.push(doc.data());
            });

            return books;
        } catch (error) {
            throw new Error('Error retrieving books from database: ' + error.message);
        }
    }

    static async getById(id) {
        try {
            const bookRef = db.collection("Books").doc(id);
            const response = await bookRef.get();
            const book = response.data();

            return book;
        } catch (error) {
            throw new Error('Error retrieving book from database: ' + error.message);
        }
    }

    static async getByGenre(genre) {
        try {
            const booksRef = db.collection("Books");
            const response = await booksRef.where("genres", "array-contains", genre).get();
            const books = [];
            response.forEach((doc) => {
                books.push(doc.data());
            });

            return books;
        } catch (error) {
            throw new Error('Error retrieving books from database: ' + error.message);
        }
    }

    static async change(id, updatedData) {
        try {
            const bookRef = db.collection("Books").doc(id);
            const response = await bookRef.get();
            const book = response.data();
            if (book == undefined) {
                throw new Error("Book does not exist");
            }

            const updatedBook = {
                ...book,
                ...updatedData,
            };

            await db.collection("Books").doc(id).set(updatedBook);
            return { message: 'Book changes successful', book: updatedBook };
        } catch (error) {
            throw new Error('Error inserting book into database: ' + error.message);
        }
    }

    static async updateRating(id) {
        try {
            const response = await fetch(`${reviewsApi}/books/${id}/averageRating`);
            const averageRating = await response.json();

            await db.collection("Books").doc(id).update({
                averageRating: averageRating,
                updatedAt: new Date().toJSON()
            });
            return { message: 'Book rating updated successfully' };
        } catch (error) {
            throw new Error('Error updating book rating: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const bookRef = db.collection("Books").doc(id);
            const response = await bookRef.get();
            const book = response.data();
            if (book == undefined) {
                throw new Error("Book does not exist");
            }
            await db.collection("Books").doc(id).delete();

            return { message: 'Book deleted' };
        } catch (error) {
            throw new Error('Error deleting book from database: ' + error.message);
        }
    }

    static async deleteByAuthor(author) {
        try {
            const booksRef = db.collection("Books").where("author", "==", author);
            const snapshot = await booksRef.get();
            if (snapshot.empty) {
                throw new Error("No books found for this author");
            }
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            return { message: `${snapshot.size} books by ${author} deleted` };
        } catch (error) {
            throw new Error('Error deleting books by author: ' + error.message);
        }
    }
}

module.exports = Book;