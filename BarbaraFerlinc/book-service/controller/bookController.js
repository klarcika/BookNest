const Book = require('../model/book');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
}

async function addBook(req, res) {
  const {
    title,
    author,
    genres,
    publishedYear,
    isbn,
    description,
    coverUrl,
    averageRating,
    ratingsCount,
    pages
  } = req.body;

  if (
    !title ||
    !author ||
    !genres ||
    !publishedYear ||
    !isbn ||
    !description ||
    !coverUrl ||
    !averageRating ||
    !ratingsCount ||
    !pages
  ) {
    return res.status(400).json({ error: "All fields must be filled" });
  }

  try {
    const newBook = await Book.add(
      title,
      author,
      genres,
      publishedYear,
      isbn,
      description,
      coverUrl,
      averageRating,
      ratingsCount,
      pages
    );

    res.status(200).json({ book: newBook });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function addMultipleBooks(req, res) {
  const books = req.body;

  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: "Request body must be a non-empty array of books" });
  }

  try {
    const addedBooks = [];

    for (const book of books) {
      const { title, author, genres, publishedYear, isbn, description, coverUrl, averageRating, ratingsCount, pages } = book;

      if ( !title || !author || !genres || !publishedYear || !isbn || !description || !coverUrl || !averageRating || !ratingsCount || !pages
      ) {
        return res.status(400).json({ error: "All fields must be filled for each book" });
      }

      const newBook = await Book.add(title, author, genres, publishedYear, isbn, description, coverUrl, averageRating, ratingsCount, pages);

      addedBooks.push(newBook);
    }

    res.status(200).json({ books: addedBooks });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function allBooks(req, res) {
  try {
    const books = await Book.all();
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function findBook(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ error: "Id is required." });
  }

  try {
    const book = await Book.getById(id);
    if (!book) {
      return res.status(404).json({ error: "Book does not exist" });
    }

    const contentInfoRes = await fetch(process.env.CONTENT_NOTICES_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: book.title, description: book.description })
    });
    const contentInfo = await contentInfoRes.json();

    const bookBadgesRes = await fetch(process.env.BOOK_BADGES_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        title: book.title, 
        genres: book.genres, 
        pages: book.pages,
        averageRating: book.averageRating, 
        ratingsCount: book.ratingsCount, 
        publishedYear: book.publishedYear
      })
    });
    const bookBadges = await bookBadgesRes.json();

    res.status(200).json({ book: book, contentInfo: contentInfo, bookBadges: bookBadges });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function findBookByGenre(req, res) {
  const { genre } = req.params;
  if (!genre) {
    return res.status(400).send({ error: "Genre is required." });
  }

  try {
    const books = await Book.getByGenre(genre);
    if (!books || books.length === 0) {
      return res.status(404).json({ error: "No books found for this genre" });
    }
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function changeBook(req, res) {
  const { id } = req.params;
  const updatedData = req.body;

  if (!id) {
    return res.status(400).send({ error: "Id is required." });
  }

  try {
    const response = await Book.change(id, updatedData);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function changeBookRating(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: "Id is required." });
  }

  try {
    const response = await Book.changeRating(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function deleteBook(req, res) {
  const { id } = req.params;
  try {
    const book = await Book.delete(id);
    if (!book) {
      return res.status(404).json({ error: "Book does not exist" });
    }
    res.status(200).json({ message: "Book successfully deleted" });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

async function deleteBooksByAuthor(req, res) {
  const { author } = req.params;
  try {
    const response = await Book.deleteByAuthor(author);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
}

module.exports = {
  authenticateToken,
  addBook,
  addMultipleBooks,
  allBooks,
  findBook,
  findBookByGenre,
  changeBook,
  changeBookRating,
  deleteBook,
  deleteBooksByAuthor
};