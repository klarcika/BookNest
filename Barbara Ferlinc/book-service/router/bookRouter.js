const express = require('express');
const router = express.Router();
const bookController = require('../controller/bookController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "New Book"
 *         author:
 *           type: string
 *           example: "Author Name"
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Fantasy", "Adventure"]
 *         publishedYear:
 *           type: integer
 *           example: 2023
 *         isbn:
 *           type: string
 *           example: "978-3-16-148410-0"
 *         description:
 *           type: string
 *           example: "A fascinating story about..."
 *         coverUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/cover.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-14T10:00:00Z"
 *         averageRating:
 *           type: number
 *           example: 4.5
 *         ratingsCount:
 *           type: integer
 *           example: 123
 *         pages:
 *           type: integer
 *           example: 350
 */

/**
 * @swagger
 * /books/addBook:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book successfully added
 */
router.post('/addBook', bookController.addBook);

/**
 * @swagger
 * /books/addMultipleBooks:
 *   post:
 *     summary: Add multiple new books
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Books successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.post('/addMultipleBooks', bookController.addMultipleBooks);

/**
 * @swagger
 * /books/allBooks:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/allBooks', bookController.allBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     responses:
 *       200:
 *         description: A single book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.get("/:id", bookController.findBook);

/**
 * @swagger
 * /books/genre/{genre}:
 *   get:
 *     summary: Get books by genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre to filter by
 *     responses:
 *       200:
 *         description: List of books in the genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/genre/:genre', bookController.findBookByGenre);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.put('/:id', bookController.changeBook);

/**
 * @swagger
 * /books/rating/{id}:
 *   put:
 *     summary: Update only the rating of a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the book to update rating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               averageRating:
 *                 type: number
 *                 format: float
 *                 example: 4.7
 *     responses:
 *       200:
 *         description: Book rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.put('/rating/:id', bookController.changeBookRating);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book successfully deleted
 */
router.delete('/:id', bookController.deleteBook);

/**
 * @swagger
 * /books/author/{author}:
 *   delete:
 *     summary: Delete books by a specific author
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: author
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the author whose books will be deleted
 *     responses:
 *       200:
 *         description: Books deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/author/:author', bookController.deleteBooksByAuthor);

module.exports = router;