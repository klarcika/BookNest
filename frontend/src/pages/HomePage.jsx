import React, { useEffect, useState } from "react";
import axios from "axios";
import BookList from "../components/Booklist";
import Shelf from "../components/Shelf";

const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [shelf, setShelf] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/books").then((res) => {
            setBooks(res.data);
        });

        axios.get("http://localhost:5000/api/users/123/shelf").then((res) => {
            setShelf(res.data);
        });
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">📚 My Goodreads Clone</h1>
            <BookList books={books} />
            <Shelf books={shelf} />
        </div>
    );
};

export default HomePage;
