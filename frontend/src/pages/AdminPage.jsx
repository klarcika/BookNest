import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { bookApi, reviewApi } from '../api';

const AdminPage = () => {
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        publishedYear: '',
        description: '',
        coverUrl: '',
    });
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        /*const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== 'admin') {
                setError('Access denied: Admins only');
                navigate('/profile');
                return;
            }
        } catch (err) {
            setError('Invalid token');
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }*/

        const fetchData = async () => {
            try {
                const reviewsRes = await reviewApi.get('/reviews');
                setReviews(reviewsRes.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch reviews');
            }
        };

        fetchData();
    }, [navigate]);

    const handleBookChange = (e) => {
        setNewBook({ ...newBook, [e.target.name]: e.target.value });
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        try {
            await bookApi.post('/books', newBook);
            setNewBook({ title: '', author: '', publishedYear: '', description: '', coverUrl: '' });
            setError('');
            alert('Book added successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add book');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewApi.delete(`/reviews/${reviewId}`);
            setReviews(reviews.filter((r) => r._id !== reviewId));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete review');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">Admin Panel</h1>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Add New Book</h2>
                <form onSubmit={handleBookSubmit} className="bg-white p-6 rounded shadow">
                    <label className="block mb-4">
                        Title:
                        <input
                            type="text"
                            name="title"
                            value={newBook.title}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Author:
                        <input
                            type="text"
                            name="author"
                            value={newBook.author}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Published Year:
                        <input
                            type="number"
                            name="publishedYear"
                            value={newBook.publishedYear}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Description:
                        <textarea
                            name="description"
                            value={newBook.description}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            rows="4"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Cover URL:
                        <input
                            type="url"
                            name="coverUrl"
                            value={newBook.coverUrl}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                        Add Book
                    </button>
                </form>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Manage Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="grid gap-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white p-4 rounded shadow">
                                <p><strong>Book ID:</strong> {review.bookId}</p>
                                <p><strong>User:</strong> {review.userName}</p>
                                <p><strong>Rating:</strong> {review.rating} ⭐</p>
                                <p><strong>Comment:</strong> {review.comment}</p>
                                <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mt-2"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No reviews available.</p>
                )}
            </section>
        </div>
    );
};

export default AdminPage;