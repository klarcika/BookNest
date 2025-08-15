const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API za upravljanje z uporabniki
 */

/**
 * @swagger
 * /users/addUser:
 *   post:
 *     summary: Dodaj novega uporabnika
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Uspešna registracija
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/addUser', userController.addUser);

/**
 * @swagger
 * /users/id:
 *   post:
 *     summary: Najdi uporabnika po ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Podatki o uporabniku
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/id', userController.findUser);

/**
 * @swagger
 * /users/allUsers:
 *   get:
 *     summary: Pridobi vse uporabnike
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Seznam vseh uporabnikov
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/allUsers', userController.allUsers);

/**
 * @swagger
 * /users/email/{id}:
 *   get:
 *     summary: Pridobi email uporabnika
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Email naslov uporabnika
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "john@example.com"
 */
router.get('/email/:id', userController.findEmail);

/**
 * @swagger
 * /users/profile/{id}:
 *   get:
 *     summary: Pridobi profil uporabnika
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Profil uporabnika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 avatarUrl:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/avatar.jpg"
 *                 bio:
 *                   type: string
 *                   example: "Avid book lover and writer."
 */
router.get('/profile/:id', userController.findProfile);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Posodobi podatke o uporabniku
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika, ki ga želiš posodobiti
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Uporabnik uspešno posodobljen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/:id', userController.changeUser);

/**
 * @swagger
 * /users/preferences/{id}:
 *   put:
 *     summary: Posodobi preferences uporabnika
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genrePreferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               notificationSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preferences uspešno posodobljene
 */
router.put('/preferences/:id', userController.changeUserPreferences);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Izbriši uporabnika po ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Uporabnik izbrisan
 */
router.delete('/:id', userController.deleteUser);


/**
 * @swagger
 * /users/emailDomain/{domain}:
 *   delete:
 *     summary: Izbriše vse uporabnike po email domeni
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Email domena (npr. example.com)
 *     responses:
 *       200:
 *         description: Uporabniki izbrisani
 */
router.delete('/emailDomain/:domain', userController.deleteUsersByEmailDomain);

module.exports = router;