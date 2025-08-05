// src/pages/HomePage.jsx
import React, { useState } from 'react';
import books from '../data/books.json';

const HomePage = () => {
    const [genreFilter, setGenreFilter] = useState('');
    const genres = [...new Set(books.flatMap(book => book.genres))];

    const filteredBooks = genreFilter
        ? books.filter(book => book.genres.includes(genreFilter))
        : books;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-purple-900">Books Available</h1>

            <div className="mb-6">
                <label className="mr-2 font-medium text-gray-700">Filter by genre:</label>
                <select
                    onChange={(e) => setGenreFilter(e.target.value)}
                    value={genreFilter}
                    className="border border-gray-300 rounded px-3 py-1 shadow-sm"
                >
                    <option value="">All</option>
                    {genres.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                    <div
                        key={book._id}
                        className="bg-white rounded-lg shadow hover:shadow-xl transition p-4 text-left"
                    >
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full object-cover rounded mb-4 aspect-[3/4]"
                        />
                        <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                        <p className="text-sm text-gray-600 mb-2">by {book.author} ({book.publishedYear})</p>
                        <p className="text-sm text-gray-700">{book.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
