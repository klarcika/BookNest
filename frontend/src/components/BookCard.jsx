const BookCard = ({ book, added, onAddToWantToRead, onOpenDetails }) => {
    return (
        <div className="p-4 bg-white shadow rounded-lg cursor-pointer" onClick={onOpenDetails}>
            <img
                src={book.coverUrl || "https://via.placeholder.com/150x220?text=No+Cover"}
                alt={book.title || "Untitled"}
                className="w-full h-56 object-cover rounded-md mb-3"
            />
            <h2 className="font-bold text-lg">{book.title || "Untitled"}</h2>
            <p className="text-sm text-gray-600">{book.author || "Unknown Author"}</p>
            <p className="text-xs text-gray-500">{book.publishedYear || "N/A"}</p>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToWantToRead();
                }}
                className={`mt-2 px-3 py-1 rounded ${
                    added ? "bg-green-500 text-white" : "bg-purple-600 text-white"
                }`}
            >
                {added ? "Added" : "Want to Read"}
            </button>
        </div>
    );
};
export default BookCard;