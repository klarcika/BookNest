import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { bookshelfApi, bookApi } from '../api';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [userId, setUserId] = useState(''); // Set this to your logged-in user ID
    const [books, setBooks] = useState([]);
    const [genreFilter, setGenreFilter] = useState('');
    const [wantToRead, setWantToRead] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await bookApi.get('/allBooks');
                console.log("API response:", res.data); // 🔎 izpiše vse iz API

                const booksFromApi = res.data.books || [];

                const uid = localStorage.getItem('userId');
                setUserId(uid);

                // Zaenkrat ne filtriraj po title
                // Če rabiš default vrednosti, lahko jih sam dodaš
                const booksWithDefaults = booksFromApi.map(book => ({
                    title: book.title || "Untitled",
                    author: book.author || "Unknown Author",
                    genres: book.genres || [],
                    publishedYear: book.publishedYear || "N/A",
                    isbn: book.isbn || "",
                    description: book.description || "",
                    coverUrl: book.coverUrl || "",
                    averageRating: book.averageRating || 0,
                    ratingsCount: book.ratingsCount || 0,
                    pages: book.pages || 0,
                    _id: book._id || Math.random().toString(36).substr(2, 9) // fallback key
                }));

                console.log("Books after mapping:", booksWithDefaults);

                setBooks(booksWithDefaults);

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err?.response?.data?.error || 'Failed to fetch books');
            }
        };

        fetchBooks();
    }, []);

    // Extract genres safely
    const genres = [
        ...new Set(
            books
                .filter(book => Array.isArray(book.genres))
                .flatMap(book => book.genres)
                .map(g => g.charAt(0).toUpperCase() + g.slice(1))
        )
    ];

    // Filter books by selected genre
    const filteredBooks = genreFilter
        ? books.filter(book => book.genres?.some(g => g.toLowerCase() === genreFilter.toLowerCase()))
        : books;

    const handleAddToWantToRead = async (bookKey) => {
        if (!userId || wantToRead.includes(bookKey)) return;

        try {
            await bookshelfApi.put(
                `/${userId}/wantToRead`,
                { bookKey },
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
            );
            setWantToRead(prev => [...prev, bookKey]);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to add book');
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    const handleOpenDetails = (bookId) => {
        navigate(`/book/${bookId}`);
    };



    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">
                DISCOVER NEW
            </h1>

            <div className="mb-6 flex items-center gap-2 justify-center">
                <label className="font-medium text-gray-700">Filter by genre:</label>
                <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 shadow-sm"
                >
                    <option value="">All</option>
                    {genres.map((g, idx) => (
                        <option key={idx} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book, index) => {
                    console.log("Rendering book:", book); // 🔎
                    return (
                        <BookCard
                            key={book._id}
                            book={book}
                            added={wantToRead.includes(book._id)}
                            onAddToWantToRead={() => handleAddToWantToRead(book._id)}
                            onOpenDetails={() => handleOpenDetails(book._id)} // <-- zdaj pošlješ pravi ID
                            userId={userId}
                        />

                    )
                })}
            </div>

        </div>
    );
};

export default HomePage;
