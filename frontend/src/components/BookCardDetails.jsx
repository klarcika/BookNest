import { Link } from "react-router-dom";
import React from "react";

const BookCardDetails = ({ book, currentShelf, onMove }) => {
    return (
        <div className="bg-white rounded shadow p-4 flex flex-col">
            <Link to={`/book/${book._id}`}>
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full object-cover rounded mb-4 aspect-[3/4] cursor-pointer"
                />
            </Link>
            <h3 className="text-lg font-semibold text-center">{book?.title}</h3>
            <p className="text-md text-gray-600 text-center">{book?.author}</p>
            <p className="text-sm text-gray-400 mb-2">{book?.publishedYear}</p>

            <select
                onChange={(e) => onMove(book._id, currentShelf, e.target.value)}
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
