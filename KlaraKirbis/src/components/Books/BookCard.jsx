import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="block">
      <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-900">{book.title}</h2>
        <p className="text-gray-600">by {book.author}</p>
      </div>
    </Link>
  );
}