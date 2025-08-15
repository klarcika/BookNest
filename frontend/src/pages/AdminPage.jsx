import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { api } from '../api';

const AdminPage = () => {
    const [userRole, setUserRole] = useState(null);
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        genre: '',
        description: '',
    });
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== 'admin') {
                setError('Access denied: Admin role required');
                navigate('/profile');
                return;
            }
            setUserRole(decoded.role);
        } catch (err) {
            setError('Invalid token');
            localStorage.removeItem('token');
            navigate('/login');
        }

        const fetchReviews = async () => {
            try {
                const response = await api.get('/reviews');
                setReviews(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch reviews');
            }
        };

        fetchReviews();
    }, [navigate]);

    const handleBookChange = (e) => {
        setBookForm({ ...bookForm, [e.target.name]: e.target.value });
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/books', bookForm);
            setBookForm({ title: '', author: '', genre: '', description: '' });
            alert('Book added successfully');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add book');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(reviews.filter((review) => review._id !== reviewId));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete review');
        }
    };

    if (!userRole) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">Admin Panel</h1>

            {/* Obrazec za dodajanje knjige */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Add New Book</h2>
                <form onSubmit={handleBookSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <label className="block mb-4 text-xl">
                        Title:
                        <input
                            type="text"
                            name="title"
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={bookForm.title}
                            onChange={handleBookChange}
                            required
                        />
                    </label>
                    <label className="block mb-4 text-xl">
                        Author:
                        <input
                            type="text"
                            name="author"
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={bookForm.author}
                            onChange={handleBookChange}
                            required
                        />
                    </label>
                    <label className="block mb-4 text-xl">
                        Genre:
                        <input
                            type="text"
                            name="genre"
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={bookForm.genre}
                            onChange={handleBookChange}
                            required
                        />
                    </label>
                    <label className="block mb-4 text-xl">
                        Description:
                        <textarea
                            name="description"
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={bookForm.description}
                            onChange={handleBookChange}
                            rows="4"
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-purple-600 text-white text-xl font-medium w-full py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        Add Book
                    </button>
                </form>
            </section>

            {/* Seznam recenzij */}
            <section>
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Manage Reviews</h2>
                {reviews.length ? (
                    <div className="grid gap-4">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                            >
                                <div>
                                    <p><strong>Book ID:</strong> {review.bookId}</p>
                                    <p><strong>User ID:</strong> {review.userId}</p>
                                    <p><strong>Rating:</strong> {review.rating} ⭐</p>
                                    <p><strong>Comment:</strong> {review.comment}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No reviews found.</p>
                )}
            </section>
        </div>
    );
};

export default AdminPage;