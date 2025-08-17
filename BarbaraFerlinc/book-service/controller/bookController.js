const Book = require('../model/book');

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
    res.status(200).json(book);
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