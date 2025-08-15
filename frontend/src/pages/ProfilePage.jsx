import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import jwtDecode from 'jwt-decode'; // Za dekodiranje JWT tokena
import { api } from '../api';
import BookCardDetails from '../components/BookCardDetails';

const ProfilePage = () => {
    const [user, setUser] = useState({
        profile: { name: 'Unknown', bio: '' },
        email: '',
    });
    const [books, setBooks] = useState([]);
    const [bookshelves, setBookshelves] = useState({ wantToRead: [], currentlyReading: [], read: [] });
    const [showReviewFormFor, setShowReviewFormFor] = useState(null);
    const [reviews, setReviews] = useState({});
    const [readingChallenge, setReadingChallenge] = useState({ goal: null, completed: 0 });
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeInput, setChallengeInput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const shelfLabels = {
        wantToRead: 'Want to Read',
        currentlyReading: 'Currently Reading',
        read: 'Read',
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Preusmeri na login, če ni tokena
            return;
        }

        const fetchData = async () => {
            try {
                // Pridobi podatke o trenutnem uporabniku
                const userRes = await api.get('/users/:id');
                setUser(userRes.data);
                setBookshelves(userRes.data.bookshelves || { wantToRead: [], currentlyReading: [], read: [] });

                // Pridobi vse knjige
                const booksRes = await api.get('/books');
                setBooks(booksRes.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const getBook = (id) => books.find((b) => b._id === id);

    const handleMove = async (bookId, fromShelf, toShelf) => {
        if (fromShelf === toShelf) return;

        try {
            const updatedShelves = {
                ...bookshelves,
                [fromShelf]: bookshelves[fromShelf].filter((id) => id !== bookId),
                [toShelf]: [...new Set([...bookshelves[toShelf], bookId])],
            };

            // Posodobi police na backendu
            await api.patch('/bookshelves', updatedShelves);
            setBookshelves(updatedShelves);

            if (toShelf === 'read') {
                setShowReviewFormFor(bookId);
                setReadingChallenge((prev) =>
                    prev.goal
                        ? { ...prev, completed: Math.min(prev.completed + 1, prev.goal) }
                        : prev
                );
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update bookshelf');
        }
    };

    const handleReviewSubmit = async (bookId) => {
        try {
            await api.post('/reviews', {
                bookId,
                rating: reviews[bookId]?.rating,
                comment: reviews[bookId]?.comment,
            });
            setShowReviewFormFor(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review');
        }
    };

    const handleChallengeSubmit = async () => {
        if (!challengeInput || isNaN(challengeInput)) return;
        const newChallenge = { goal: parseInt(challengeInput), completed: 0 };
        try {
            await api.patch('/users/me/challenge', { goal: newChallenge.goal });
            setReadingChallenge(newChallenge);
            setShowChallengeForm(false);
            setChallengeInput('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to set challenge');
        }
    };

    const renderBooks = (bookIds, currentShelf) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bookIds.map((id) => {
                const book = getBook(id);
                if (!book) return null;
                return (
                    <div key={id}>
                        <BookCardDetails
                            book={book}
                            currentShelf={currentShelf}
                            shelfLabels={shelfLabels}
                            onMove={(toShelf) => handleMove(id, currentShelf, toShelf)}
                        />
                        {showReviewFormFor === id && (
                            <div className="mt-3 w-full bg-purple-50 p-3 rounded text-sm">
                                <h4 className="font-semibold mb-1 text-purple-800">Leave a Review</h4>
                                <label className="block mb-2">
                                    Rating:
                                    <select
                                        className="ml-2 border px-1 py-0.5 rounded"
                                        onChange={(e) => {
                                            setReviews((prev) => ({
                                                ...prev,
                                                [id]: { ...prev[id], rating: e.target.value },
                                            }));
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <option key={n} value={n}>{n} ⭐</option>
                                        ))}
                                    </select>
                                </label>
                                <textarea
                                    className="w-full border rounded px-2 py-1 mb-2"
                                    rows="3"
                                    placeholder="Write your thoughts..."
                                    onChange={(e) => {
                                        setReviews((prev) => ({
                                            ...prev,
                                            [id]: { ...prev[id], comment: e.target.value },
                                        }));
                                    }}
                                />
                                <button
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                                    onClick={() => handleReviewSubmit(id)}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">User Profile</h1>

            <div className="bg-white rounded shadow p-6 mb-6 text-left max-w-4xl mx-auto">
                <p><strong>Name:</strong> {user.profile.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Bio:</strong> {user.profile.bio}</p>

                <div className="mt-6 flex items-center gap-6">
                    {readingChallenge.goal ? (
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full border-4 border-purple-600 flex items-center justify-center text-lg font-bold text-purple-800">
                                {readingChallenge.completed}/{readingChallenge.goal}
                            </div>
                            <button
                                onClick={() => setReadingChallenge({ goal: null, completed: 0 })}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Reset
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowChallengeForm(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                        >
                            Add Yearly Reading Challenge
                        </button>
                    )}
                </div>

                {showChallengeForm && (
                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Number of books"
                            value={challengeInput}
                            onChange={(e) => setChallengeInput(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                        <button
                            onClick={handleChallengeSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">✅ Read</h2>
                {bookshelves.read.length ? (
                    renderBooks(bookshelves.read, 'read')
                ) : (
                    <p className="text-gray-600">No books read yet.</p>
                )}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📖 Currently Reading</h2>
                {bookshelves.currentlyReading.length ? (
                    renderBooks(bookshelves.currentlyReading, 'currentlyReading')
                ) : (
                    <p className="text-gray-600">No books currently reading.</p>
                )}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📚 Want to Read</h2>
                {bookshelves.wantToRead.length ? (
                    renderBooks(bookshelves.wantToRead, 'wantToRead')
                ) : (
                    <p className="text-gray-600">No books in wishlist.</p>
                )}
            </section>
        </div>
    );
};

export default ProfilePage;