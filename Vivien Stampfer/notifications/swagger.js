import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Obvestila API",
      version: "1.0.0",
      description: "API za obveščanje o novih knjigah, recenzijah prijateljev in bralnih izzivih.",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
    components: {
      schemas: {
        Obvestilo: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66abc1234567890abcdef123" },
            uporabnikId: { type: "string", example: "6890d8a7904558ba7cea90b8" },
            tip: { type: "string", enum: ["novaKnjiga", "recenzijaPrijatelja", "bralniIzziv"], example: "novaKnjiga" },
            vsebina: { type: "object" },
            status: { type: "string", enum: ["vrsta", "poslano", "napaka", "prebrano"], example: "vrsta" },
            napaka: { type: "string", example: "" },
            datumUstvarjeno: { type: "string", format: "date-time", example: "2025-08-12T10:00:00.000Z" },
            datumPoslano: { type: "string", format: "date-time", example: null }
          }
        },
        NovaKnjigaVsebina: {
          type: "object",
          properties: {
            naslovKnjige: { type: "string", example: "The Hobbit" },
            avtor: { type: "string", example: "J.R.R. Tolkien" },
            sporocilo: { type: "string", example: "Dodana je nova knjiga: The Hobbit" }
          }
        },
        RecenzijaPrijateljaVsebina: {
          type: "object",
          properties: {
            prijatelj: { type: "string", example: "Klara Kirbiš" },
            naslovKnjige: { type: "string", example: "The Hobbit" },
            ocena: { type: "number", example: 4 },
            sporocilo: { type: "string", example: "Klara Kirbiš je dodala novo recenzijo za The Hobbit" }
          }
        },
        BralniIzzivVsebina: {
          type: "object",
          properties: {
            nazivIzziva: { type: "string", example: "Poletni bralni maraton" },
            status: { type: "string", example: "v teku" },
            sporocilo: { type: "string", example: "Rok za dokončanje izziva \"Poletni bralni maraton\" se izteče kmalu" }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(options);

export { swaggerUi, swaggerDocs };
