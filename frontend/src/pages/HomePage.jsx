// src/pages/HomePage.jsx
import React, { useState } from 'react';
import books from '../data/books.json';

const HomePage = () => {
    const [genreFilter, setGenreFilter] = useState('');
    const [wantToRead, setWantToRead] = useState([]); // Simulacija user bookshelves
    const genres = [...new Set(books.flatMap(book => book.genres))];

    const filteredBooks = genreFilter
        ? books.filter(book => book.genres.includes(genreFilter))
        : books;

    const handleAddToWantToRead = (bookId) => {
        if (!wantToRead.includes(bookId)) {
            setWantToRead(prev => [...prev, bookId]);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-purple-900">DISCOVER NEW</h1>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

                {filteredBooks.map(book => (
                    <div
                        key={book._id}
                        className="bg-white rounded-lg shadow hover:shadow-xl transition p-4 text-left flex flex-col"
                    >
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full object-cover rounded mb-4 aspect-[3/4]"
                        />
                        <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                        <p className="text-sm text-gray-600 mb-2">by {book.author} ({book.publishedYear})</p>
                        <p className="text-sm text-gray-700 mb-4 flex-grow">{book.description}</p>

                        <button
                            onClick={() => handleAddToWantToRead(book._id)}
                            disabled={wantToRead.includes(book._id)}
                            className={`self-end px-3 py-1 rounded text-white font-medium 
                ${wantToRead.includes(book._id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {wantToRead.includes(book._id) ? 'Added ✓' : '+ Want to read '}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
