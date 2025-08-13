// src/pages/RecommendationsPage.jsx
import React, { useEffect, useState } from 'react';

const currentUserId = "6890d8a7904558ba7cea90b8";

const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState(null);
    const [books, setBooks] = useState([]);
    const [userShelves, setUserShelves] = useState({ wantToRead: [], read: [], currentlyReading: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1️⃣ Pridobi priporočila za uporabnika
                const recRes = await fetch(`http://localhost:3003/recommendations/${currentUserId}`);
                const recData = await recRes.json();
                setRecommendations(recData);

                // 2️⃣ Pridobi knjige (da imaš naslovnice in naslove)
                const booksRes = await fetch(`http://localhost:3003/books`);
                const booksData = await booksRes.json();
                setBooks(booksData);

                // 3️⃣ Pridobi uporabnikove police
                const userRes = await fetch(`http://localhost:3003/users/${currentUserId}`);
                const userData = await userRes.json();
                setUserShelves(userData.bookshelves || { wantToRead: [], read: [], currentlyReading: [] });

            } catch (error) {
                console.error("Napaka pri pridobivanju podatkov:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddToWantToRead = (bookId) => {
        if (userShelves.wantToRead.includes(bookId)) return;
        setUserShelves(prev => ({
            ...prev,
            wantToRead: [...prev.wantToRead, bookId]
        }));

        // Po želji: Pošlji na backend
        fetch(`http://localhost:3003/users/${currentUserId}/want-to-read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId })
        }).catch(err => console.error(err));
    };

    if (loading) return <p>Nalaganje priporočil...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-purple-900">📚 Recommended for You</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {recommendations?.recommendedBooks.map(id => {
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
