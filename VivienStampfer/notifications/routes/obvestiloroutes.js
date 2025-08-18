import { Router } from "express";
import {
  seznamObvestil, enoObvestilo, dodajObvestilo, posodobiObvestilo, izbrisiObvestilo, izbrisiVsaZaUporabnika, authenticateToken
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
 *         description: Napaka pri pridobivanju obvestil
 */
r.get("/",authenticateToken, seznamObvestil);

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
 *               knjigaId:
 *                 type: string
 *               izzivId:
 *                 type: string
 *               podatki:
 *                 type: object
 *                 description: Dodatni podatki glede na tip
 *     responses:
 *       201:
 *         description: Obvestilo uspešno ustvarjeno
 *       400:
 *         description: Manjkajo obvezni podatki ali napačna kombinacija polj
 *       500:
 *         description: Napaka pri ustvarjanju obvestila
 */
r.post("/", dodajObvestilo);

/**
 * @swagger
 * /obvestila/po-uporabniku/{uporabnikId}:
 *   delete:
 *     summary: Izbriši vsa obvestila za uporabnika
 *     description: Izbriše vsa obvestila, ki pripadajo določenemu uporabniku.
 *     parameters:
 *       - in: path
 *         name: uporabnikId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
 *     responses:
 *       200:
 *         description: Obvestila uspešno izbrisana
 *       400:
 *         description: Manjka uporabnikId
 *       500:
 *         description: Napaka pri množičnem brisanju obvestil
 */
r.delete("/po-uporabniku/:uporabnikId", izbrisiVsaZaUporabnika);

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
 *       500:
 *         description: Napaka pri pridobivanju obvestila
 */
r.get("/:id", enoObvestilo);

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
 *         description: Napaka pri posodabljanju obvestila
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
 *         description: Napaka pri brisanju obvestila
 */
r.delete("/:id", izbrisiObvestilo);

export default r;
