import React, { useEffect, useState } from 'react';
import { recommendationApi, bookApi } from '../api';
import BookCard from '../components/BookCard';

const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('jwtToken');

                if (!userId || !token) {
                    setError('Uporabnik ni prijavljen.');
                    setLoading(false);
                    return;
                }

                // Pridobi priporočila
                const recRes = await recommendationApi.get(`/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Recommendations response:', recRes.data);
                setRecommendations(recRes.data?.recommendedBooks || []);

                // Pridobi vse knjige
                const booksRes = await bookApi.get('/allBooks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Books response:', booksRes.data);
                setBooks(booksRes.data.books || []);
            } catch (err) {
                console.error("❌ Napaka pri pridobivanju podatkov:", err.response?.data || err.message);
                setError('Napaka pri nalaganju priporočil. Preveri konzolo za več informacij.');
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
            <h1 className="text-3xl font-bold mb-6 text-purple-900">📚 Moja priporočila</h1>
            {recommendations.length === 0 ? (
                <p className="text-gray-600">Ni priporočil za prikaz.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.map(rec => {
                        const book = books.find(b => b._id === rec.bookId);
                        if (!book) return null;

                        return (
                            <BookCard
                                key={rec._id}
                                book={book}
                                added={false} // po potrebi lahko spremeniš
                                onAddToWantToRead={() => console.log(`Dodaj knjigo ${book.title}`)}
                                onOpenDetails={() => console.log(`Odpri podrobnosti knjige ${book.title}`)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecommendationsPage;
