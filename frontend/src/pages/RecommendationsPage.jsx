// src/pages/RecommendationsPage.jsx
import React, { useState } from 'react';
import recommendations from '../data/recommendations.json';
import books from '../data/books.json';
import users from '../data/users.json';

const currentUserId = "64fa1e1b0000000000000001";

const RecommendationsPage = () => {
    const rec = recommendations.find(r => r.userId === currentUserId);
    const [userShelves, setUserShelves] = useState(() => {
        const user = users.find(u => u._id === currentUserId);
        return user?.bookshelves || { wantToRead: [], read: [], currentlyReading: [] };
    });

    const handleAddToWantToRead = (bookId) => {
        if (userShelves.wantToRead.includes(bookId)) return;
        setUserShelves(prev => ({
            ...prev,
            wantToRead: [...prev.wantToRead, bookId]
        }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-purple-900">📚 Recommended for You</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {rec?.recommendedBooks.map(id => {
                    const book = books.find(b => b._id === id);
                    return (
                        <div key={id} className="bg-white p-4 rounded shadow flex flex-col items-center text-center">
                            <img
                                src={book?.coverUrl}
                                alt={book?.title}
                                className="w-full object-cover rounded aspect-[3/4] mb-3"
                            />
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">{book?.title}</h2>
                            <p className="text-sm text-gray-600 mb-3">by {book?.author}</p>

                            <button
                                onClick={() => handleAddToWantToRead(book._id)}
                                className={`text-sm px-4 py-2 rounded font-medium ${
                                    userShelves.wantToRead.includes(book._id)
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                                disabled={userShelves.wantToRead.includes(book._id)}
                            >
                                {userShelves.wantToRead.includes(book._id)
                                    ? '✔ In Want to Read'
                                    : '+ Want to Read'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendationsPage;
