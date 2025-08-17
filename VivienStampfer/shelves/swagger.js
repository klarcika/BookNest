import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shelves API",
      version: "1.0.0",
      description: "API za upravljanje uporabnikovih knjižnih polic (wantToRead, reading, read).",
    },
    servers: [
      {
        url: "http://localhost:3005",
      },
    ],
    components: {
      schemas: {
        Shelves: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66abc1234567890abcdef123" },
            userId: { type: "string", example: "6890d8a7904558ba7cea90b8" },
            shelves: {
              type: "object",
              properties: {
                wantToRead: {
                  type: "array",
                  items: { $ref: "#/components/schemas/WantToReadEntry" }
                },
                reading: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ReadingEntry" }
                },
                read: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ReadingEntry" }
                }
              }
            }
          }
        },
        WantToReadEntry: {
          type: "object",
          properties: {
            bookId: { type: "string", example: "6890d975904558ba7cea90bb" },
            date: { type: "string", format: "date-time", example: "2025-08-01T08:00:00.000Z" }
          },
          required: ["bookId", "date"]
        },
        ReadingEntry: {
          type: "object",
          properties: {
            bookId: { type: "string", example: "689c4e53670dc4914867cb40" },
            dateAdded: { type: "string", format: "date-time", example: "2025-08-01T10:00:00.000Z" }
          },
          required: ["bookId", "dateAdded"]
        },
        AddToWantToReadRequest: {
          type: "object",
          properties: {
            bookId: { type: "string" },
            date: { type: "string", format: "date-time" }
          },
          required: ["bookId", "date"]
        },
        AddToReadingOrReadRequest: {
          type: "object",
          properties: {
            bookId: { type: "string" },
            dateAdded: { type: "string", format: "date-time" }
          },
          required: ["bookId", "dateAdded"]
        },
        MoveBookRequest: {
          type: "object",
          properties: {
            from: { type: "string", enum: ["wantToRead", "reading", "read"], example: "reading" },
            to: { type: "string", enum: ["wantToRead", "reading", "read"], example: "read" },
            bookId: { type: "string", example: "689c4e4a670dc4914867cb3f" },
            date: { type: "string", format: "date-time", example: "2025-08-15T10:00:00.000Z" },
            dateAdded: { type: "string", format: "date-time", example: "2025-08-15T10:00:00.000Z" }
          },
          required: ["from", "to", "bookId"]
        }
      }
    }
  },
  apis: ["./routes/*.js"], 
};

const swaggerDocs = swaggerJsdoc(options);

export { swaggerUi, swaggerDocs };
