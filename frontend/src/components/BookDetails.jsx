import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { api } from "../api";

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [user, setUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Pridobi podatke o knjigi
                const bookRes = await api.get(`/books/${id}`);
                setBook(bookRes.data);
                setComments(bookRes.data.comments || []);

                // Pridobi podatke o trenutnem uporabniku
                const userRes = await api.get("/users/me");
                setUser(userRes.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch data");
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        };

        fetchData();
    }, [id, navigate]);

    const hasRead = user?.bookshelves?.read.includes(id);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await api.post("/reviews", {
                bookId: id,
                text: newComment,
            });
            setComments([...comments, { _id: response.data._id, userId: user._id, userName: user.profile.name, text: newComment }]);
            setNewComment("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add comment");
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return;
        try {
            await api.patch(`/reviews/${commentId}`, { text: editCommentText });
            setComments(comments.map((c) => (c._id === commentId ? { ...c, text: editCommentText } : c)));
            setEditCommentId(null);
            setEditCommentText("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to edit comment");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/reviews/${commentId}`);
            setComments(comments.filter((c) => c._id !== commentId));
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete comment");
        }
    };

    if (!book) return <p>Loading...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex flex-col md:flex-row gap-6">
                <img src={book.coverUrl} alt={book.title} className="w-60 object-cover rounded" />
                <div>
                    <h1 className="text-3xl font-bold text-purple-900">{book.title}</h1>
                    <p className="text-lg text-gray-700">{book.author}</p>
                    <p className="text-md text-gray-500">{book.publishedYear}</p>
                    <p className="mt-4 text-md">{book.description}</p>
                    <p className="mt-2 text-yellow-600">⭐ {book.rating || "No rating yet"}</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Comments</h2>
                {comments.length > 0 ? (
                    comments.map((c) => (
                        <div key={c._id} className="bg-purple-50 p-3 rounded mb-2">
                            <p className="font-semibold">{c.userName}</p>
                            {editCommentId === c._id ? (
                                <div>
                                    <textarea
                                        className="w-full border rounded px-2 py-1 mb-2"
                                        rows="3"
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleEditComment(c._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditCommentId(null)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p>{c.text}</p>
                                    {c.userId === user?._id && (
                                        <div className="mt-2">
                                            <button
                                                onClick={() => {
                                                    setEditCommentId(c._id);
                                                    setEditCommentText(c.text);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(c._id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No comments yet.</p>
                )}

                {hasRead && (
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
                )}
            </div>
        </div>
    );
};

export default BookDetails;