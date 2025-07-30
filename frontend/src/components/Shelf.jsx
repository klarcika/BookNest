import React from "react";

const Shelf = ({ books }) => {
    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold">📌 My Shelf</h2>
            <ul className="space-y-2 mt-2">
                {books.map((item) => (
                    <li key={item.bookId} className="border p-2 rounded">
                        {item.bookTitle} (Added: {new Date(item.dateAdded).toLocaleDateString()})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Shelf;
