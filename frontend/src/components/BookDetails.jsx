import { useParams } from "react-router-dom";
import { useState } from "react";
import books from "../data/books.json";
import users from "../data/users.json";

const currentUserId = "64fa1e1b0000000000000001"; // Barbara

const BookDetails = () => {
    const { id } = useParams();
    const book = books.find(b => b._id === id);
    const user = users.find(u => u._id === currentUserId);

    const [comments, setComments] = useState(book.comments || []);
    const [newComment, setNewComment] = useState("");

    const hasRead = user.bookshelves.read.includes(book._id);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const updatedComments = [...comments, { user: user.profile.name, text: newComment }];
        setComments(updatedComments);
        setNewComment("");
        // tu bi lahko poslali na backend
    };

    if (!book) return <p>Book not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <div className="flex flex-col md:flex-row gap-6">
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-60 object-cover rounded"
                />
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
                    comments.map((c, idx) => (
                        <div key={idx} className="bg-purple-50 p-3 rounded mb-2">
                            <p className="font-semibold">{c.user}</p>
                            <p>{c.text}</p>
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
