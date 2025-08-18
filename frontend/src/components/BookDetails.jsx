import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookApi } from "../api";

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await bookApi.get(`/${id}`);
                setBook(res.data);
            } catch (err) {
                console.error("Failed to fetch book:", err);
            }
        };

        fetchBook();
    }, [id]);

    if (!book) return <p>Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <img src={book.coverUrl || "https://via.placeholder.com/150x220"} alt={book.title} />
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-lg">{book.author}</p>
            <p>{book.description}</p>
            {/* tukaj lahko dodaš še review-e */}
        </div>
    );
};

export default BookDetails;
