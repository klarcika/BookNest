import { Link } from "react-router-dom";
import React from "react";

const BookCardDetails = ({ book, currentShelf, onMove }) => {
    if (!book) return null; // varnost, če book ni definiran

    return (
        <div className="bg-white rounded shadow p-4 flex flex-col">
            <Link to={`/book/${book._id}`}>
                <img
                    src={book.coverUrl || '/placeholder.jpg'}
                    alt={book.title || 'No title'}
                    className="w-full object-cover rounded mb-4 aspect-[3/4] cursor-pointer"
                />
            </Link>
            <h3 className="text-lg font-semibold text-center">{book.title || 'Unknown title'}</h3>
            <p className="text-md text-gray-600 text-center">{book.author || 'Unknown author'}</p>
            <p className="text-sm text-gray-400 mb-2">{book.publishedYear || 'N/A'}</p>

            <select
                onChange={(e) => onMove(e.target.value)}
                value={currentShelf}
                className="text-sm mt-auto bg-purple-100 border border-purple-300 rounded px-2 py-1 text-purple-800 mb-2"
            >
                <option value={currentShelf}>{currentShelf} ✓</option>
                <option value="wantToRead">Move to: Want to Read</option>
                <option value="currentlyReading">Move to: Currently Reading</option>
                <option value="read">Move to: Read</option>
            </select>
        </div>
    );
};

export default BookCardDetails;
