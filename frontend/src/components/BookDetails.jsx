import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookApi, reviewApi } from "../api";

const BookDetailsPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [showType, setShowType] = useState("reviews"); // "reviews" or "comments"
    const [newComment, setNewComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookAndReviews = async () => {
            try {
                // 📚 Detajli knjige
                const bookRes = await bookApi.get(`/${id}`);
                setBook(bookRes.data.book);

                // ⭐ Reviews
                try {
                    const reviewRes = await reviewApi.get(`/books/${id}/reviews`);
                    setReviews(reviewRes.data.items || []);
                } catch (err) {
                    console.error("Error fetching reviews:", err);
                }

                try {
                    const commentRes = await reviewApi.get(`/books/${id}/comments`);
                    setComments(commentRes.data.data?.items || []);
                } catch (err) {
                    console.error("Error fetching comments:", err);
                }

            } catch (err) {
                console.error("Error fetching book details:", err);
                setError(err?.response?.data?.error || "Failed to load book details");
            } finally {
                setLoading(false);
            }
        };

        fetchBookAndReviews();
    }, [id]);

    // Add comment handler
    const handleAddComment = async () => {
        console.log("Adding comment:", newComment);
        if (!newComment.trim()) {
            setCommentError("Comment cannot be empty.");
            return;
        }
        setSubmitting(true);
        setCommentError("");
        try {
            const userId = localStorage.getItem("userId") || localStorage.getItem("name");
            const res = await reviewApi.post(
                "/comments",
                {
                    userId,
                    bookId: id,
                    comment: newComment,
                },
            );
            if (res.status === 201 && res.data && res.data.data) {
                setComments((prev) => [res.data.data, ...prev]);
                setNewComment("");
            } else if (res.status === 422 && res.data.type && res.data.word) {
                setCommentError(`Your comment contains inappropriate content: "${res.data.word}" (${res.data.type})`);
            }
        } catch (err) {
            setCommentError(err?.response?.data?.message || err?.message || "Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
    if (!book) return <p className="text-center mt-10">Book not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Notification for comment error
            {commentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
                    <span>{commentError}</span>
                    <button
                        className="ml-4 text-red-700 font-bold text-lg focus:outline-none"
                        onClick={() => setCommentError("")}
                        aria-label="Dismiss notification"
                    >
                        &times;
                    </button>
                </div>
            )} */}
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

            {/* Toggle Button */}
            <div className="mt-10 flex gap-4">
                <button
                    className={`px-4 py-2 rounded ${showType === "reviews" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setShowType("reviews")}
                >
                    Show Reviews
                </button>
                <button
                    className={`px-4 py-2 rounded ${showType === "comments" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setShowType("comments")}
                >
                    Show Comments
                </button>
            </div>

            {/* Reviews or Comments Section */}
            <div className="mt-6">
                {showType === "reviews" ? (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg shadow-sm">
                                        <p className="font-semibold">{"Anonymous"}</p>
                                        <p className="text-yellow-500">Rating: {review.rating || 0}/5</p>
                                        <p className="text-gray-700">{review.review || "No review text."}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                        {/* Add Comment Input */}
                        <div className="mb-4">
                            <textarea
                                className="w-full border rounded px-2 py-1 mb-2"
                                rows="3"
                                placeholder="Write your comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submitting}
                            />
                            <button
                                onClick={handleAddComment}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                                disabled={submitting}
                            >
                                {submitting ? "Adding..." : "Add Comment"}
                            </button>
                            {commentError && <p className="text-red-500 mt-2">{commentError}</p>}
                        </div>
                        {comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg shadow-sm">
                                        <p className="font-semibold">{"Anonymous"}</p>
                                        <p className="text-gray-700">{comment.comment || "No comment."}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BookDetailsPage;
