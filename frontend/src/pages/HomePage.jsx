import React, { useState, useEffect } from 'react';
import books from '../data/books.json';
import BookCard from '../components/BookCard';
import { bookshelfApi, userApi } from '../api';

const HomePage = () => {
    const [userId, setUserId] = useState(null);
    const [genreFilter, setGenreFilter] = useState('');
    const [wantToRead, setWantToRead] = useState([]);
    const [error, setError] = useState('');

    // Zbiramo vse unikatne žanre iz books.json
    const genres = [...new Set(books.flatMap(book => book.genres))];

    const filteredBooks = genreFilter
        ? books.filter(book => book.genres.includes(genreFilter))
        : books;

    // Pridobimo userId in trenutno polico wantToRead
    useEffect(() => {
        const fetchUserAndShelves = async () => {
            try {
                const userRes = await userApi.get('/me');
                const uid = userRes?.data?.id;
                setUserId(uid);

                const shelvesRes = await bookshelfApi.get(`/?userId=${uid}`);
                const shelfData = shelvesRes?.data?.[0]?.shelves || {};
                setWantToRead(shelfData.wantToRead?.map(item => item.bookId) || []);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to fetch user or shelves');
            }
        };
        fetchUserAndShelves();
    }, []);

    const handleAddToWantToRead = async (bookId) => {
        if (!userId) return;
        if (!wantToRead.includes(bookId)) {
            try {
                const res = await bookshelfApi.put(`/${userId}/wantToRead`, {
                    bookId,
                    date: new Date().toISOString()
                });

                setWantToRead(prev => [...prev, bookId]);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to add book');
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">DISCOVER NEW</h1>

            <div className="mb-6 flex items-center gap-2 justify-center">
                <label className="font-medium text-gray-700">Filter by genre:</label>
                <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 shadow-sm"
                >
                    <option value="">All</option>
                    {genres.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                    ))}
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
