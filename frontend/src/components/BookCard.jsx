import React from 'react';
import {Link} from "react-router-dom";

const BookCard = ({ book, added, onAddToWantToRead }) => {
    return (
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition p-4 text-left flex flex-col cursor-pointer">
            <Link to={`/book/${book._id}`}>
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full object-cover rounded mb-4 aspect-[3/4] cursor-pointer"
                />
            </Link>

            <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-2">by {book.author} ({book.publishedYear})</p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToWantToRead();
                }}
                disabled={added}
                className={`self-end px-3 py-1 rounded text-white font-medium 
        ${added ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
                {added ? 'Added ✓' : '+ Want to read '}
            </button>

        </div>
    );
};

export default BookCard;
