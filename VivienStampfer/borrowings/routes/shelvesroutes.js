import { Router } from "express";
import {
  getShelves,
  getShelvesById,
  createShelves,
  updateShelves,
  deleteShelves,
  dodajKnjigoVWantToRead,
  dodajKnjigoVReading,
  dodajKnjigoVRead,
  premakniKnjigoMedPolicami,
  izbrisiKnjigoSPolice,
  izbrisiShelvesByUser
} from "../controllers/shelves.controller.js";
const { authenticateToken } = require('../controllers/shelves.controller.js'); // Prilagodi pot

const r = Router();

/**
 * @swagger
 * tags:
 *   - name: Shelves
 *     description: Upravljanje uporabnikovih polic (wantToRead, reading, read)
 */

/**
 * @swagger
 * /shelves:
 *   get:
 *     tags: [Shelves]
 *     summary: Vrne seznam shelves dokumentov
 *     description: Po želji filtrira po `userId`.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Napaka pri pridobivanju polic
 */
r.get("/",authenticateToken, getShelves);

/**
 * @swagger
 * /shelves/{id}:
 *   get:
 *     tags: [Shelves]
 *     summary: Vrne en shelves dokument po ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID shelves dokumenta
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri pridobivanju polic po ID
 */
r.get("/:id",authenticateToken, getShelvesById);

/**
 * @swagger
 * /shelves:
 *   post:
 *     tags: [Shelves]
 *     summary: Ustvari nov shelves dokument za uporabnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               shelves:
 *                 type: object
 *                 properties:
 *                   wantToRead:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required: [bookId, date]
 *                       properties:
 *                         bookId: { type: string }
 *                         date: { type: string, format: date-time }
 *                   reading:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required: [bookId, dateAdded]
 *                       properties:
 *                         bookId: { type: string }
 *                         dateAdded: { type: string, format: date-time }
 *                   read:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required: [bookId, dateAdded]
 *                       properties:
 *                         bookId: { type: string }
 *                         dateAdded: { type: string, format: date-time }
 *           example:
 *             userId: "6890d8a7904558ba7cea90b8"
 *             shelves:
 *               wantToRead:
 *                 - { bookId: "6890d975904558ba7cea90bb", date: "2025-08-01T08:00:00.000Z" }
 *               reading:
 *                 - { bookId: "689c4e53670dc4914867cb40", dateAdded: "2025-08-01T10:00:00.000Z" }
 *               read:
 *                 - { bookId: "689c4e4a670dc4914867cb3f", dateAdded: "2025-08-01T10:00:00.000Z" }
 *     responses:
 *       201:
 *         description: Ustvarjeno
 *       400:
 *         description: userId je obvezen
 *       500:
 *         description: Napaka pri ustvarjanju polic
 */
r.post("/",authenticateToken, createShelves);

/**
 * @swagger
 * /shelves/{id}:
 *   put:
 *     tags: [Shelves]
 *     summary: Posodobi celoten shelves dokument po ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID shelves dokumenta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Polja za posodobitev
 *           example:
 *             shelves:
 *               reading:
 *                 - { bookId: "NEW_ID", dateAdded: "2025-08-15T12:00:00.000Z" }
 *     responses:
 *       200:
 *         description: Posodobljeno
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri posodabljanju polic
 */
r.put("/:id",authenticateToken, updateShelves);

/**
 * @swagger
 * /shelves/{id}:
 *   delete:
 *     tags: [Shelves]
 *     summary: Izbriši shelves dokument po ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID shelves dokumenta
 *     responses:
 *       200:
 *         description: Police izbrisane
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri brisanju polic
 */
r.delete("/:id",authenticateToken, deleteShelves);

/**
 * @swagger
 * /shelves/{userId}/wantToRead:
 *   put:
 *     tags: [Shelves]
 *     summary: Dodaj eno knjigo na wantToRead
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             required: [bookId, date]
 *             properties:
 *               bookId: { type: string }
 *               date: { type: string, format: date-time }
 *           example:
 *             bookId: "6890d975904558ba7cea90bb"
 *             date: "2025-08-01T08:00:00.000Z"
 *     responses:
 *       200:
 *         description: Dodano
 *       400:
 *         description: bookId in date sta obvezna
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri dodajanju na wantToRead
 */
r.put("/:userId/wantToRead",authenticateToken, dodajKnjigoVWantToRead);

/**
 * @swagger
 * /shelves/{userId}/reading:
 *   put:
 *     tags: [Shelves]
 *     summary: Dodaj eno knjigo na reading
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             required: [bookId, dateAdded]
 *             properties:
 *               bookId: { type: string }
 *               dateAdded: { type: string, format: date-time }
 *           example:
 *             bookId: "689c4e53670dc4914867cb40"
 *             dateAdded: "2025-08-01T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Dodano
 *       400:
 *         description: bookId in dateAdded sta obvezna
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri dodajanju na reading
 */
r.put("/:userId/reading",authenticateToken ,dodajKnjigoVReading);

/**
 * @swagger
 * /shelves/{userId}/read:
 *   put:
 *     tags: [Shelves]
 *     summary: Dodaj eno knjigo na read
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             required: [bookId, dateAdded]
 *             properties:
 *               bookId: { type: string }
 *               dateAdded: { type: string, format: date-time }
 *           example:
 *             bookId: "689c4e4a670dc4914867cb3f"
 *             dateAdded: "2025-08-01T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Dodano
 *       400:
 *         description: bookId in dateAdded sta obvezna
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri dodajanju na read
 */
r.put("/:userId/read",authenticateToken, dodajKnjigoVRead);

/**
 * @swagger
 * /shelves/{userId}/move:
 *   post:
 *     tags: [Shelves]
 *     summary: Premakni knjigo iz ene police na drugo
 *     description: Premakne knjigo med policami istega uporabnika.
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             required: [from, to, bookId]
 *             properties:
 *               from:
 *                 type: string
 *                 enum: [wantToRead, reading, read]
 *               to:
 *                 type: string
 *                 enum: [wantToRead, reading, read]
 *               bookId: { type: string }
 *               date: { type: string, format: date-time, description: "Obvezen, če wantToRead" }
 *               dateAdded: { type: string, format: date-time, description: "Obvezn, če reading ali read" }
 *           examples:
 *             readingToRead:
 *               summary: reading -> read
 *               value:
 *                 from: "reading"
 *                 to: "read"
 *                 bookId: "689c4e4a670dc4914867cb3f"
 *                 dateAdded: "2025-08-15T10:00:00.000Z"
 *             wantToReadToReading:
 *               summary: wantToRead -> reading
 *               value:
 *                 from: "wantToRead"
 *                 to: "reading"
 *                 bookId: "6890d975904558ba7cea90bb"
 *                 dateAdded: "2025-08-10T09:00:00.000Z"
 *             toWantToRead:
 *               summary: reading -> wantToRead
 *               value:
 *                 from: "reading"
 *                 to: "wantToRead"
 *                 bookId: "6890d975904558ba7cea90bb"
 *                 date: "2025-08-12T09:00:00.000Z"
 *     responses:
 *       200:
 *         description: Premaknjeno
 *       400:
 *         description: Neveljavne police 'from' ali 'to' / bookId je obvezen / manjkajoči datumi
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri premikanju knjige med policami
 */
r.post("/:userId/move",authenticateToken, premakniKnjigoMedPolicami);

/**
 * @swagger
 * /shelves/by-user/{userId}:
 *   delete:
 *     tags: [Shelves]
 *     summary: Izbriši shelves dokument po userId
 *     description: Izbriše celoten dokument shelves za določenega uporabnika.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Police izbrisane po userId
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri brisanju polic po userId
 */
r.delete("/by-user/:userId",authenticateToken, izbrisiShelvesByUser);

/**
 * @swagger
 * /shelves/{userId}/{shelf}/{bookId}:
 *   delete:
 *     tags: [Shelves]
 *     summary: Odstrani eno knjigo s točno določene police
 *     description: Odstrani določeno knjigo z izbrane police uporabnika.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *       - in: path
 *         name: shelf
 *         required: true
 *         schema:
 *           type: string
 *           enum: [wantToRead, reading, read]
 *         description: Ime police
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID knjige
 *     responses:
 *       200:
 *         description: Knjiga odstranjena
 *       400:
 *         description: Neveljavna polica
 *       404:
 *         description: Police niso najdene
 *       500:
 *         description: Napaka pri odstranjevanju knjige s police
 */
r.delete("/:userId/:shelf/:bookId",authenticateToken, izbrisiKnjigoSPolice);

export default r;
