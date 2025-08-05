// src/pages/RecommendationsPage.jsx
import React from 'react';
import recommendations from '../data/recommendations.json';
import books from '../data/books.json';

const currentUserId = "64fa1e1b0000000000000001";

const RecommendationsPage = () => {
    const rec = recommendations.find(r => r.userId === currentUserId);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Recommended for You</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rec?.recommendedBooks.map(id => {
                    const book = books.find(b => b._id === id);
                    return (
                        <div key={id} className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-semibold">{book?.title}</h2>
                            <p className="text-md text-gray-600">by {book?.author}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendationsPage;
