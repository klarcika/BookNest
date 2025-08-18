import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { bookApi, reviewApi } from "../api";

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await bookApi.get(`/${id}`);
                setBook(response.data);
            } catch (err) {
                console.error("Failed to fetch book:", err);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await reviewApi.get(`/books/${id}/comments`);
                const items = response.data.data?.items?.slice(0, 20) || [];
                setComments(items);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch comments");
            }
        };
        fetchComments();

        fetchBook();
    }, []);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            // console.log(`Adding book ${id} to want to read list for user ${localStorage.getItem('userId')}, token: ${localStorage.getItem('jwtToken')}`);
            const response = await reviewApi.post("/comments", 
                {
                    userId: localStorage.getItem('userId'),
                    bookId: id,
                    comment: newComment,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
            );

            setComments(prev => [
                ...prev,
                {
                    _id: response.data._id || `comment-${prev.length}`,
                    text: newComment,
                },
            ]);
            setNewComment("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add comment");
        }
    };

    if (!book) return <p className="text-center mt-10">Loading book...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Book Info */}
            <div className="flex flex-col md:flex-row gap-6">
                {book.coverUrl && (
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-60 object-cover rounded"
                    />
                )}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-purple-900">{book.title}</h1>
                    <p className="text-lg text-gray-700">{book.author}</p>
                    <p className="text-md text-gray-500">{book.publishedYear}</p>
                    {book.description && (
                        <p className="mt-4 text-md">{book.description}</p>
                    )}
                    <p className="mt-2 text-yellow-600">
                        ⭐ {book.averageRating || "No rating yet"}
                    </p>
                    {book.genres?.length > 0 && (
                        <p className="mt-2 text-gray-600">
                            <strong>Genres:</strong> {book.genres.join(", ")}
                        </p>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Comments</h2>

                {comments.length > 0 ? (
                    comments.map((c, idx) => (
                        <div
                            key={c._id || idx}
                            className="bg-purple-50 p-3 rounded mb-2"
                        >
                            {/* <p className="font-semibold">{c.userName || "Anonymous"}</p> */}
                            <p>{c.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No comments yet.</p>
                )}

                {/* Add Comment */}
                <div className="mt-4">
                    <textarea
                        className="w-full border rounded px-2 py-1 mb-2"
                        rows="3"
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        onClick={handleAddComment}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                        Add Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
