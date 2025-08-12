import { Router } from "express";
import {
  seznamObvestil, enoObvestilo, dodajObvestilo, posodobiObvestilo, izbrisiObvestilo
} from "../controllers/obvestilo.controller.js";

const r = Router();

/**
 * @swagger
 * /obvestila:
 *   get:
 *     summary: Pridobi seznam obvestil
 *     description: Vrne vsa obvestila, možnost filtriranja po uporabniku, statusu in tipu.
 *     parameters:
 *       - in: query
 *         name: uporabnikId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [vrsta, poslano, napaka, prebrano]
 *       - in: query
 *         name: tip
 *         schema:
 *           type: string
 *           enum: [novaKnjiga, recenzijaPrijatelja, bralniIzziv]
 *     responses:
 *       200:
 *         description: Uspešno pridobljen seznam obvestil
 *       500:
 *         description: Napaka na strežniku
 */
r.get("/", seznamObvestil);

/**
 * @swagger
 * /obvestila/{id}:
 *   get:
 *     summary: Pridobi eno obvestilo
 *     description: Vrne podrobnosti določenega obvestila po ID-ju.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID obvestila
 *     responses:
 *       200:
 *         description: Uspešno pridobljeno obvestilo
 *       404:
 *         description: Obvestilo ni najdeno
 */
r.get("/:id", enoObvestilo);

/**
 * @swagger
 * /obvestila:
 *   post:
 *     summary: Ustvari novo obvestilo
 *     description: Doda novo obvestilo glede na tip (nova knjiga, recenzija prijatelja, bralni izziv)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uporabnikId
 *               - tip
 *             properties:
 *               uporabnikId:
 *                 type: string
 *               tip:
 *                 type: string
 *                 enum: [novaKnjiga, recenzijaPrijatelja, bralniIzziv]
 *               status:
 *                 type: string
 *                 enum: [vrsta, poslano, napaka, prebrano]
 *               podatki:
 *                 type: object
 *                 description: Dodatni podatki odvisni od tipa
 *     responses:
 *       201:
 *         description: Obvestilo uspešno ustvarjeno
 *       400:
 *         description: Manjkajo obvezni podatki
 *       500:
 *         description: Napaka na strežniku
 */
r.post("/", dodajObvestilo);

/**
 * @swagger
 * /obvestila/{id}:
 *   put:
 *     summary: Posodobi obstoječe obvestilo
 *     description: Posodobi podatke obvestila glede na ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Polja, ki jih želimo posodobiti
 *     responses:
 *       200:
 *         description: Obvestilo uspešno posodobljeno
 *       404:
 *         description: Obvestilo ni najdeno
 *       500:
 *         description: Napaka na strežniku
 */
r.put("/:id", posodobiObvestilo);

/**
 * @swagger
 * /obvestila/{id}:
 *   delete:
 *     summary: Izbriši obvestilo
 *     description: Izbriše obvestilo glede na ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Obvestilo uspešno izbrisano
 *       404:
 *         description: Obvestilo ni najdeno
 *       500:
 *         description: Napaka na strežniku
 */
r.delete("/:id", izbrisiObvestilo);

export default r;
