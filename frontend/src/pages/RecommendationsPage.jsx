import React, { useEffect, useState } from 'react';
import { recommendationApi, bookApi } from '../api';

const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1️⃣ Pridobi priporočila (brez userId)
                const recRes = await recommendationApi.get('/');
                console.log('Recommendations response:', recRes.data);
                setRecommendations(recRes.data.recommendedBooks || []);

                // 2️⃣ Pridobi vse knjige
                const booksRes = await bookApi.get('/allBooks');
                console.log('Books response:', booksRes.data);
                setBooks(booksRes.data || []);

            } catch (err) {
                console.error("❌ Napaka pri pridobivanju podatkov:", err.response?.data || err.message);
                setError('Failed to load recommendations. Check console for details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p className="text-center text-gray-600">⏳ Nalaganje priporočil...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">📚 Vsa priporočila</h1>
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecommendationsPage;
