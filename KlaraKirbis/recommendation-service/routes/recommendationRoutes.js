
/**
 * @swagger
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       required:
 *         - userId
 *         - recommendedBooks
 *       properties:
 *         userId:
 *           type: string
 *           description: ID uporabnika
 *         recommendedBooks:
 *           type: array
 *           items:
 *             type: string
 *           description: Seznam ID-jev priporočenih knjig
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Datum generiranja priporočil
 *       example:
 *         userId: "64f23a7bc4e4a670dc491486"
 *         recommendedBooks:
 *           - "64f23a7bc4e4a670dc491111"
 *           - "64f23a7bc4e4a670dc491222"
 *         generatedAt: "2025-08-13T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Upravljanje priporočil knjig
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendationController');

/**
 * @swagger
 * /recommendations/{userId}:
 *   get:
 *     summary: Pridobi priporočila za določenega uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Uspešno pridobljena priporočila
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recommendation'
 *       404:
 *         description: Priporočila niso najdena
 *       500:
 *         description: Napaka na strežniku
 */
router.get('/:userId', controller.getRecommendationsForUser);

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Pridobi vsa priporočila (admin/debug)
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Uspešno pridobljena priporočila
 *       500:
 *         description: Napaka na strežniku
 */
router.get('/', controller.getAllRecommendations);

/**
 * @swagger
 * /recommendations/{userId}:
 *   post:
 *     summary: Ustvari nova priporočila za uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recommendedBooks:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               recommendedBooks: ["64f23a7bc4e4a670dc491111"]
 *     responses:
 *       201:
 *         description: Priporočila ustvarjena
 *       400:
 *         description: Napačen vnos podatkov
 *       500:
 *         description: Napaka na strežniku
 */
router.post('/:userId', controller.createRecommendationsForUser);

/**
 * @swagger
 * /recommendations/{userId}/add:
 *   post:
 *     summary: Dodaj knjigo v priporočila uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *             example:
 *               bookId: "64f23a7bc4e4a670dc491111"
 *     responses:
 *       200:
 *         description: Knjiga dodana v priporočila
 *       404:
 *         description: Uporabnik ne obstaja
 *       500:
 *         description: Napaka na strežniku
 */
router.post('/:userId/add', controller.addBookToRecommendations);

/**
 * @swagger
 * /recommendations/{userId}:
 *   put:
 *     summary: Posodobi priporočila za uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recommendedBooks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Priporočila posodobljena
 *       500:
 *         description: Napaka na strežniku
 */
router.put('/:userId', controller.updateRecommendations)
/**
 * @swagger
 * /recommendations/{userId}/book/{bookId}:
 *   put:
 *     summary: Posodobi posamezno priporočilo knjige za uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID uporabnika
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID knjige za posodobitev
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newBookId:
 *                 type: string
 *             example:
 *               newBookId: "64f23a7bc4e4a670dc499999"
 *     responses:
 *       200:
 *         description: Posamezno priporočilo posodobljeno
 *       404:
 *         description: Uporabnik ali knjiga ni najdena
 *       500:
 *         description: Napaka na strežniku
 */
router.put('/:userId/book/:bookId', controller.updateSingleRecommendation);
/**
 * @swagger
 * /recommendations/{userId}:
 *   delete:
 *     summary: Izbriši vsa priporočila uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Vsa priporočila uporabnika so bila izbrisana
 *       404:
 *         description: Priporočila za uporabnika niso najdena
 *       500:
 *         description: Napaka na strežniku
 */
router.delete('/:userId', controller.deleteRecommendationsForUser);
/**
 * @swagger
 * /recommendations/{userId}/book/{bookId}:
 *   delete:
 *     summary: Izbriši knjigo iz priporočil uporabnika
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Knjiga izbrisana iz priporočil
 *       404:
 *         description: Knjiga ali uporabnik ne obstaja
 *       500:
 *         description: Napaka na strežniku
 */
router.delete('/:userId/book/:bookId', controller.deleteSingleRecommendation);

module.exports = router;
