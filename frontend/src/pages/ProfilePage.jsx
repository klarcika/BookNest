import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi, bookshelfApi, reviewApi, statisticApi } from '../api';
import BookCardDetails from '../components/BookCardDetails';

const ProfilePage = () => {
    const { id } = useParams();
    const [user, setUser] = useState({ profile: { name: 'Unknown', bio: '' }, email: '' });
    const [books, setBooks] = useState([]);
    const [bookshelves, setBookshelves] = useState({ wantToRead: [], currentlyReading: [], read: [] });
    const [showReviewFormFor, setShowReviewFormFor] = useState(null);
    const [reviews, setReviews] = useState({});
    const [readingChallenge, setReadingChallenge] = useState({ goal: null, completed: 0 });
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeInput, setChallengeInput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const shelfLabels = { wantToRead: 'Want to Read', currentlyReading: 'Currently Reading', read: 'Read' };

    // Naloži uporabnika in police
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await userApi.post('/id', { id }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                });
                setUser(userRes?.data || { profile: { name: 'Unknown', bio: '' }, email: '' });

                const shelvesRes = await bookshelfApi.get(`/?userId=${userRes?.data?._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                });

                const shelfData = shelvesRes?.data?.[0]?.shelves || { wantToRead: [], currentlyReading: [], read: [] };
                setBookshelves({
                    wantToRead: shelfData.wantToRead || [],
                    currentlyReading: shelfData.currentlyReading || [],
                    read: shelfData.read || [],
                });
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to fetch data');
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [id, navigate]);

    // Naloži vse knjige
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await bookshelfApi.get('/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                });
                setBooks(res.data || []);
            } catch {
                setError('Failed to load books');
            }
        };
        fetchBooks();
    }, []);

    const getBook = (id) => books.find((b) => b?.id === id || b?._id === id);

    const handleMove = async (bookId, fromShelf, toShelf) => {
        if (fromShelf === toShelf) return;
        try {
            const updatedShelves = {
                ...bookshelves,
                [fromShelf]: bookshelves[fromShelf]?.filter((item) => item?.bookId !== bookId) || [],
                [toShelf]: [
                    ...(bookshelves[toShelf] || []),
                    { bookId, date: new Date().toISOString() },
                ],
            };

            await bookshelfApi.post(`/${user?._id}/move`, {
                from: fromShelf,
                to: toShelf,
                bookId,
                date: new Date().toISOString(),
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } });

            setBookshelves(updatedShelves);

            if (toShelf === 'read') {
                setShowReviewFormFor(bookId);
                setReadingChallenge(prev => prev?.goal ? { ...prev, completed: Math.min(prev.completed + 1, prev.goal) } : prev);
            }
        } catch {
            setError('Failed to update bookshelf');
        }
    };

    const handleReviewSubmit = async (bookId) => {
        try {
            await reviewApi.post('/reviews', {
                bookId,
                rating: reviews?.[bookId]?.rating,
                comment: reviews?.[bookId]?.comment
            });
            setShowReviewFormFor(null);
        } catch {
            setError('Failed to submit review');
        }
    };

    const handleChallengeSubmit = async () => {
        if (!challengeInput || isNaN(challengeInput)) return;
        try {
            await statisticApi.post('/goals', { userId: user._id, targetBooks: parseInt(challengeInput) }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
            });
            setReadingChallenge({ goal: parseInt(challengeInput), completed: 0 });
            setShowChallengeForm(false);
            setChallengeInput('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to set challenge');
        }
    };

    const renderBooks = (bookIds = [], currentShelf) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bookIds.map((item) => {
                const book = getBook(item?.bookId);
                if (!book) return null;
                return (
                    <div key={item.bookId}>
                        <BookCardDetails
                            book={book}
                            currentShelf={currentShelf}
                            shelfLabels={shelfLabels}
                            onMove={(toShelf) => handleMove(item.bookId, currentShelf, toShelf)}
                        />
                        {showReviewFormFor === item.bookId && (
                            <div className="mt-3 w-full bg-purple-50 p-3 rounded text-sm">
                                <h4 className="font-semibold mb-1 text-purple-800">Leave a Review</h4>
                                <label className="block mb-2">
                                    Rating:
                                    <select
                                        className="ml-2 border px-1 py-0.5 rounded"
                                        onChange={(e) => setReviews(prev => ({
                                            ...prev,
                                            [item.bookId]: { ...prev[item.bookId], rating: e.target.value },
                                        }))}
                                    >
                                        <option value="">Select</option>
                                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                    </select>
                                </label>
                                <textarea
                                    className="w-full border rounded px-2 py-1 mb-2"
                                    rows="3"
                                    placeholder="Write your thoughts..."
                                    onChange={(e) => setReviews(prev => ({
                                        ...prev,
                                        [item.bookId]: { ...prev[item.bookId], comment: e.target.value },
                                    }))}
                                />
                                <button
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                                    onClick={() => handleReviewSubmit(item.bookId)}
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

            <div className="flex justify-end mb-4">
                <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
                    onClick={() => {
                        localStorage.removeItem('jwtToken');
                        navigate('/login');
                    }}
                >
                    Logout
                </button>
            </div>

            <button
                onClick={() => navigate(`/notifications/${user._id}`)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-4"
            >
                🔔 Poglej obvestila
            </button>

            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">User Profile</h1>

            <div className="bg-white rounded shadow p-6 mb-6 text-left max-w-4xl mx-auto">
                <p><strong>Name:</strong> {user?.profile?.name || 'Unknown'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Bio:</strong> {user?.profile?.bio || ''}</p>

                <div className="mt-6 flex items-center gap-6">
                    {readingChallenge?.goal ? (
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full border-4 border-purple-600 flex items-center justify-center text-lg font-bold text-purple-800">
                                {readingChallenge.completed}/{readingChallenge.goal}
                            </div>
                            <button
                                onClick={() => setReadingChallenge({goal: null, completed: 0})}
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
                {bookshelves?.read?.length ? renderBooks(bookshelves.read, 'read') :
                    <p className="text-gray-600">No books read yet.</p>}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📖 Currently Reading</h2>
                {bookshelves?.currentlyReading?.length ? renderBooks(bookshelves.currentlyReading, 'currentlyReading') :
                    <p className="text-gray-600">No books currently reading.</p>}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📚 Want to Read</h2>
                {bookshelves?.wantToRead?.length ? renderBooks(bookshelves.wantToRead, 'wantToRead') :
                    <p className="text-gray-600">No books in wishlist.</p>}
            </section>
        </div>
    );
};

export default ProfilePage;
