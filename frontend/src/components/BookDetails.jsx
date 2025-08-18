import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookApi } from "../api";

const BookDetailsPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookAndReviews = async () => {
            try {
                // 📚 Detajli knjige
                const bookRes = await bookApi.get(`/${id}`);
                setBook(bookRes.data);

                // ⭐ Reviewi
                const reviewRes = await bookApi.get(`/${id}/reviews`);
                setReviews(reviewRes.data.reviews || []);

            } catch (err) {
                console.error("Error fetching book details:", err);
                setError(err?.response?.data?.error || "Failed to load book details");
            } finally {
                setLoading(false);
            }
        };

        fetchBookAndReviews();
    }, [id]);

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
    if (!book) return <p className="text-center mt-10">Book not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex gap-6">
                <img
                    src={book.coverUrl || "https://via.placeholder.com/150x220"}
                    alt={book.title}
                    className="w-48 h-72 object-cover rounded-lg shadow"
                />
                <div>
                    <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                    <p className="text-lg text-gray-700">by {book.author || "Unknown Author"}</p>
                    <p className="text-sm text-gray-500 mb-4">{book.publishedYear || "N/A"}</p>
                    <p className="text-gray-800">{book.description || "No description available."}</p>
                </div>
            </div>

            {/* ⭐ Reviews section */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review, idx) => (
                            <div key={idx} className="p-4 border rounded-lg shadow-sm">
                                <p className="font-semibold">{review.userName || "Anonymous"}</p>
                                <p className="text-yellow-500">Rating: {review.rating || 0}/5</p>
                                <p className="text-gray-700">{review.comment || "No comment."}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default BookDetailsPage;
