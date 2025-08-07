import React, { useState } from 'react';
import users from '../data/users.json';
import books from '../data/books.json';

const currentUserId = "64fa1e1b0000000000000001"; // Barbara

const ProfilePage = () => {
    const user = users.find(u => u._id === currentUserId);
    const [bookshelves, setBookshelves] = useState(user.bookshelves);
    const [showReviewFormFor, setShowReviewFormFor] = useState(null);
    const [reviews, setReviews] = useState({});

    const getBook = id => books.find(b => b._id === id);

    const shelfLabels = {
        wantToRead: 'Want to Read',
        currentlyReading: 'Currently Reading',
        read: 'Read'
    };

    const handleMove = (bookId, fromShelf, toShelf) => {
        if (fromShelf === toShelf) return;

        setBookshelves(prev => ({
            ...prev,
            [fromShelf]: prev[fromShelf].filter(id => id !== bookId),
            [toShelf]: [...new Set([...prev[toShelf], bookId])]
        }));

        if (toShelf === "read") {
            setShowReviewFormFor(bookId);
        }
    };

    const handleReviewSubmit = (bookId) => {
        console.log("Review for book:", bookId, reviews[bookId]);
        // Shraniš lahko tudi v lokalno datoteko, ali pošlješ na backend
        setShowReviewFormFor(null);
    };

    const renderBooks = (bookIds, currentShelf) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bookIds.map(id => {
                const book = getBook(id);
                return (
                    <div key={id} className="bg-white rounded shadow p-4 flex flex-col">
                        <img
                            src={book?.coverUrl}
                            alt={book?.title}
                            className="w-full object-cover rounded aspect-[3/4] mb-2"
                        />
                        <h3 className="text-md font-semibold text-center">{book?.title}</h3>
                        <p className="text-sm text-gray-600 text-center">{book?.author}</p>
                        <p className="text-xs text-gray-400 mb-2">{book?.publishedYear}</p>

                        <select
                            onChange={(e) => handleMove(id, currentShelf, e.target.value)}
                            value={currentShelf}
                            className="text-sm mt-auto bg-purple-100 border border-purple-300 rounded px-2 py-1 text-purple-800 mb-2"
                        >
                            {Object.entries(shelfLabels).map(([shelfKey, label]) =>
                                    shelfKey !== currentShelf && (
                                        <option key={shelfKey} value={shelfKey}>{`Move to: ${label}`}</option>
                                    )
                            )}
                            <option value={currentShelf}>{shelfLabels[currentShelf]} ✓</option>
                        </select>

                        {showReviewFormFor === id && (
                            <div className="mt-3 w-full bg-purple-50 p-3 rounded text-sm">
                                <h4 className="font-semibold mb-1 text-purple-800">Leave a Review</h4>
                                <label className="block mb-2">
                                    Rating:
                                    <select
                                        className="ml-2 border px-1 py-0.5 rounded"
                                        onChange={(e) => {
                                            setReviews(prev => ({
                                                ...prev,
                                                [id]: {
                                                    ...prev[id],
                                                    rating: e.target.value
                                                }
                                            }));
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <option key={n} value={n}>{n} ⭐</option>
                                        ))}
                                    </select>
                                </label>
                                <textarea
                                    className="w-full border rounded px-2 py-1 mb-2"
                                    rows="3"
                                    placeholder="Write your thoughts..."
                                    onChange={(e) => {
                                        setReviews(prev => ({
                                            ...prev,
                                            [id]: {
                                                ...prev[id],
                                                comment: e.target.value
                                            }
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
        <div >
        <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">User Profile</h1>

            <div className="bg-white rounded shadow p-6 mb-10 text-left max-w-4xl mx-auto">
                <p><strong>Name:</strong> {user.profile.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Bio:</strong> {user.profile.bio}</p>
            </div>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">✅ Read</h2>
                {bookshelves.read.length
                    ? renderBooks(bookshelves.read, "read")
                    : <p className="text-gray-600">No books read yet.</p>}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📖 Currently Reading</h2>
                {bookshelves.currentlyReading.length
                    ? renderBooks(bookshelves.currentlyReading, "currentlyReading")
                    : <p className="text-gray-600">No books currently reading.</p>}
            </section>

            <section className="mb-10 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">📚 Want to Read</h2>
                {bookshelves.wantToRead.length
                    ? renderBooks(bookshelves.wantToRead, "wantToRead")
                    : <p className="text-gray-600">No books in wishlist.</p>}
            </section>
        </div>
    );
};

export default ProfilePage;
