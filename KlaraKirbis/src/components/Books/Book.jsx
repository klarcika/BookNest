import { useParams } from "react-router-dom";

const books = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 2, title: "1984", author: "George Orwell" },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen" },
  { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: 5, title: "Moby-Dick", author: "Herman Melville" },
];

export default function Book() {
  const { id } = useParams();
  const book = books.find((b) => b.id === parseInt(id));

  if (!book) {
    return <div className="p-6">Book not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p className="text-gray-600">by {book.author}</p>
    </div>
  );
}