const BookCard = ({ book, added, onAddToWantToRead, onOpenDetails, userId }) => {
    return (
        <div
            onClick={onOpenDetails} // <-- navigate when the card is clicked
            className="bg-white rounded-lg shadow hover:shadow-xl transition p-4 text-left flex flex-col cursor-pointer"
        >
            <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full object-cover rounded mb-4 aspect-[3/4]"
            />

            <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-2">
                by {book.author} ({book.publishedYear})
            </p>

            { userId && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        onAddToWantToRead();
                    }}
                    disabled={added}
                    className={`self-end px-3 py-1 rounded text-white font-medium 
                        ${added ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {added ? 'Added ✓' : '+ Want to read '}
                </button>
            )}
        </div>
    );
};
export default BookCard;