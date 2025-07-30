import React from "react";
import axios from "axios";

const BookList = ({ books }) => {
    const addToShelf = (bookId) => {
        axios.post("http://localhost:5000/api/users/123/shelf", {
            bookId: bookId,
            shelfName: "Want to Read",
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold">All Books</h2>
            <ul className="space-y-2 mt-2">
                {books.map((book) => (
                    <li key={book._id} className="flex items-center justify-between border p-2 rounded">
                        <div>
                            <strong>{book.title}</strong> – {book.authors?.map((a) => a.name).join(", ")}
                        </div>
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                            onClick={() => addToShelf(book._id)}
                        >
                            ➕ Add to Shelf
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;
