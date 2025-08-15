import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Katalog API",
            version: "1.0.0",
            description: "API za upravljanje s katalogom knjig.",
        },
        servers: [
            {
                url: "http://localhost:3032",
            },
        ],
        components: {
            schemas: {
                Book: {
                    type: "object",
                    properties: {
                        title: { type: "string", example: "New Book" },
                        author: { type: "string", example: "Author Name" },
                        genres: { 
                            type: "array", 
                            items: { type: "string" }, 
                            example: ["Fantasy", "Adventure"] 
                        },
                        publishedYear: { type: "integer", example: 2023 },
                        isbn: { type: "string", example: "978-3-16-148410-0" },
                        description: { type: "string", example: "A fascinating story about..." },
                        coverUrl: { type: "string", format: "uri", example: "https://example.com/cover.jpg" },
                        createdAt: { type: "string", format: "date-time", example: "2025-08-14T10:00:00Z" },
                        averageRating: { type: "number", format: "float", example: 4.5 },
                        ratingsCount: { type: "integer", example: 123 },
                        pages: { type: "integer", example: 350 }
                    }
                }
            }
        }
    },
    apis: ["./router/*.js"],
};

const swaggerDocs = swaggerJsdoc(options);

export { swaggerUi, swaggerDocs };
