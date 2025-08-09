import React, { useState } from 'react';
import books from '../data/books.json';
import BookCard from '../components/BookCard'; // predpostavimo, da obstaja

const HomePage = () => {
    const [genreFilter, setGenreFilter] = useState('');
    const [wantToRead, setWantToRead] = useState([]); // simulacija user bookshelves

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
                    <BookCard
                        key={book._id}
                        book={book}
                        added={wantToRead.includes(book._id)}
                        onAddToWantToRead={() => handleAddToWantToRead(book._id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
