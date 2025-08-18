import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookApi, reviewApi, userApi } from '../api';
const AdminPage = () => {
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        genres: [],
        publishedYear: '',
        isbn: '',
        description: '',
        coverUrl: '',
        averageRating: 0,
        ratingsCount: 0,
        pages: 0,
    });
    const [error, setError] = useState('');
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [added, setAdded] = useState(false);
    const [deleteAuthor, setDeleteAuthor] = useState('');
    const [deleteDomain, setDeleteDomain] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await userApi.post('/id',
                    { id: localStorage.getItem('userId') },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
                );
                if (userRes?.data?.role !== 'admin') {
                    navigate(`/profile/${userRes?.data?._id}`);
                }

                const res = await userApi.get('/allUsers',
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
                );
                const usersFromApi = res.data.users || [];
                console.log("Users from API:", usersFromApi);
                setUsers(usersFromApi);

                const res1 = await bookApi.get('/allBooks',
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
                );
                const booksFromApi = res1.data.books || [];
                const booksWithDefaults = booksFromApi.map(book => ({
                    title: book.title || "Untitled",
                    author: book.author || "Unknown Author",
                    genres: book.genres || [],
                    publishedYear: book.publishedYear || "N/A",
                    isbn: book.isbn || "",
                    description: book.description || "",
                    coverUrl: book.coverUrl || "",
                    averageRating: book.averageRating || 0,
                    ratingsCount: book.ratingsCount || 0,
                    pages: book.pages || 0,
                    _id: book._id
                }));

                console.log("Books after mapping:", booksWithDefaults);

                setBooks(booksWithDefaults);

                setAdded(false);
                setDeleted(false);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to fetch data');
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [navigate, added, deleteAuthor, deleteDomain, deleted]);

    const handleBookChange = (e) => {
        setNewBook({ ...newBook, [e.target.name]: e.target.value });
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await bookApi.post('/addBook',
                newBook,
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
            );
            if (response.status === 200) {
                setNewBook({ title: '', author: '', genres: [], publishedYear: '', isbn: '',
                    description: '', coverUrl: '', averageRating: 0, ratingsCount: 0, pages: 0 });
                setError('');
                alert('Book added successfully!');
                setBooks([...books, response.data]);
                setLoading(false);
                setAdded(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add book');
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            const res = await bookApi.delete(`/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
            });
            console.log('Delete book response: ', res);
            setBooks(books.filter((b) => b._id !== id));
            setDeleted(true);
        } catch (err) {
            alert('Failed to delete book');
            console.log(err.status, err.message);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    const handleDeleteByAuthor = async () => {
        try {
            const res = await bookApi.delete(`/author/${deleteAuthor}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
            });
            if (res.status===200) {
                setBooks(books.filter((b) => b.author !== deleteAuthor));
                setDeleteAuthor('');
            }
        } catch (err) {
            alert('Failed to delete books by author');
            console.log(err.status, err.message);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    const handleDeleteUsersByDomain = async () => {
        try {
            await userApi.delete(`/emailDomain/${deleteDomain}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
            });
            setDeleteDomain('');
            alert(`Deleted users with domain ${deleteDomain}`);
        } catch (err) {
            alert('Failed to delete users by domain');
            console.log(err.status, err.message);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const res = await userApi.delete(`/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
            });
            setUsers(users.filter((u) => u._id !== id));
            setDeleted(true);
        } catch (err) {
            alert('Failed to delete user');
            console.log(err.status, err.message);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.removeItem('jwtToken');
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <h1 className="text-3xl font-bold mb-6 text-purple-900 text-center">Admin Panel</h1>

            {/* Tabela knjig */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">All Books</h2>
                {books && books.length > 0 ? (

                <table className="w-full border-collapse border border-gray-300 bg-white">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Author</th>
                        <th className="border p-2">Year</th>
                        <th className="border p-2">Average Rating</th>
                        <th className="border p-2">Ratings Count</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {books.map((book) => (
                        <tr key={book._id}>
                        <td className="border p-2">{book.title}</td>
                        <td className="border p-2">{book.author}</td>
                        <td className="border p-2">{book.publishedYear}</td>
                        <td className="border p-2">{book.averageRating}</td>
                        <td className="border p-2">{book.ratingsCount}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleDeleteBook(book._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                Delete
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                <p>No books available.</p>
                )}
            </section>

            {/* Brisanje knjig po avtorju */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Delete Books by Author</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={deleteAuthor}
                        onChange={(e) => setDeleteAuthor(e.target.value)}
                        placeholder="Author name"
                        className="border rounded px-3 py-2 flex-grow"
                    />
                    <button
                        onClick={handleDeleteByAuthor}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Delete by Author
                    </button>
                </div>
            </section>

            {/* Tabela uporabnikov */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">All Users</h2>
                {users && users.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 bg-white">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                        <td className="border p-2">{user.profile.name}</td>
                        <td className="border p-2">{user.email}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                Delete
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                <p>No books available.</p>
                )}
            </section>

            {/* Brisanje userjev po domeni */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Delete Users by Email Domain</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={deleteDomain}
                        onChange={(e) => setDeleteDomain(e.target.value)}
                        placeholder="e.g. gmail.com"
                        className="border rounded px-3 py-2 flex-grow"
                    />
                    <button
                        onClick={handleDeleteUsersByDomain}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Delete Users
                    </button>
                </div>
            </section>

            {/* Dodajanje knjige */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Add New Book</h2>
                <form onSubmit={handleBookSubmit} className="bg-white p-6 rounded shadow">
                    <label className="block mb-4">
                        Title:
                        <input
                            type="text"
                            name="title"
                            value={newBook.title}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Author:
                        <input
                            type="text"
                            name="author"
                            value={newBook.author}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Genres:
                        <select
                            name="genres"
                            multiple
                            value={newBook.genres}
                            onChange={(e) =>
                            setNewBook({
                                ...newBook,
                                genres: Array.from(e.target.selectedOptions, (option) => option.value),
                            })
                            }
                            className="w-full border rounded px-3 py-2 mt-1"
                        >
                            <option value="Fantasy">Fantasy</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Romance">Romance</option>
                            <option value="Science Fiction">Science Fiction</option>
                            <option value="Non-fiction">Non-fiction</option>
                            <option value="Horror">Horror</option>
                            <option value="Thriller">Thriller</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) / Cmd (Mac) to select multiple</p>
                        </label>
                    <label className="block mb-4">
                        Published Year:
                        <input
                            type="number"
                            name="publishedYear"
                            value={newBook.publishedYear}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        ISBN:
                        <input
                            type="text"
                            name="isbn"
                            value={newBook.isbn}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                        />
                    </label>
                    <label className="block mb-4">
                        Description:
                        <textarea
                            name="description"
                            value={newBook.description}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            rows="4"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Cover URL:
                        <input
                            type="url"
                            name="coverUrl"
                            value={newBook.coverUrl}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        Average Rating:
                        <input
                            type="number"
                            step="0.1"
                            name="averageRating"
                            value={newBook.averageRating}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                        />
                    </label>
                    <label className="block mb-4">
                        Ratings Count:
                        <input
                            type="number"
                            name="ratingsCount"
                            value={newBook.ratingsCount}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                        />
                    </label>
                    <label className="block mb-4">
                        Pages:
                        <input
                            type="number"
                            name="pages"
                            value={newBook.pages}
                            onChange={handleBookChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                        />
                    </label>
                    <button
                        type="submit"
                        className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Adding book...' : 'Add Book'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default AdminPage;