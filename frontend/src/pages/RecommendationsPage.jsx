import React, { useEffect, useState } from 'react';
import { recommendationApi, bookApi, bookshelfApi } from '../api';

const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [books, setBooks] = useState([]);
    const [userShelves, setUserShelves] = useState({ wantToRead: [], read: [], currentlyReading: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) {
                setError('No user logged in. Please log in.');
                setLoading(false);
                return;
            }

            try {
                // 1️⃣ Pridobi priporočila
                const recRes = await recommendationApi.get(`/recommendations?userId=${currentUserId}`);
                console.log('Recommendations response:', recRes.data);
                setRecommendations(recRes.data.recommendedBooks || []);

                // 2️⃣ Pridobi vse knjige
                const booksRes = await bookApi.get('/books/allBooks');
                console.log('Books response:', booksRes.data);
                setBooks(booksRes.data || []);

                // 3️⃣ Pridobi uporabnikove police
                const userRes = await bookshelfApi.get(`/shelves?userId=${currentUserId}`);
                console.log('Shelves response:', userRes.data);
                const shelfData = userRes.data[0]?.shelves || { wantToRead: [], read: [], currentlyReading: [] };
                setUserShelves({
                    wantToRead: shelfData.wantToRead || [],
                    read: shelfData.read || [],
                    currentlyReading: shelfData.reading || [],
                });

            } catch (err) {
                console.error("❌ Napaka pri pridobivanju podatkov:", err.response?.data || err.message);
                setError('Failed to load recommendations. Check console for details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserId]);

    const handleAddToWantToRead = async (bookId) => {
        if (userShelves.wantToRead.includes(bookId)) return;

        try {
            setUserShelves(prev => ({
                ...prev,
                wantToRead: [...prev.wantToRead, bookId]
            }));

            await bookshelfApi.post(`/${currentUserId}/want-to-read`, { bookId });
        } catch (err) {
            console.error("❌ Napaka pri dodajanju knjige:", err.response?.data || err.message);
            setError('Failed to add book to want to read.');
        }
    };

    if (loading) return <p className="text-center text-gray-600">⏳ Nalaganje priporočil...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">📚 Recommended for You</h1>
            {recommendations.length === 0 ? (
                <p className="text-gray-600">Ni priporočil za prikaz.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.map(id => {
                        const book = books.find(b => b._id === id);
                        if (!book) return null;

                        return (
                            <div key={id} className="bg-white p-4 rounded shadow flex flex-col items-center text-center">
                                <img
                                    src={book.coverUrl || 'https://placehold.co/200x300'}
                                    alt={book.title}
                                    className="w-full object-cover rounded aspect-[3/4] mb-3"
                                />
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h2>
                                <p className="text-sm text-gray-600 mb-3">by {book.author || 'Unknown'}</p>
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
            )}
        </div>
    );
};

export default RecommendationsPage;