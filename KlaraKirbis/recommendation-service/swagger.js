import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Priporočila API",
            version: "1.0.0",
            description: "API za priporočila knjig za uporabnike.",
        },
        servers: [
            {
                url: "http://localhost:3003/api-docs",
            },
        ],
        components: {
            schemas: {
                Recommendation: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "6890db90904558ba7cea90c0" },
                        userId: { type: "string", example: "6890d8a7904558ba7cea90b8" },
                        recommendedBooks: {
                            type: "array",
                            items: { type: "string", example: "6890d975904558ba7cea90bb" }
                        },
                        generatedAt: { type: "string", format: "date-time", example: "2025-07-02T10:00:00Z" }
                    }
                },
                CreateRecommendationInput: {
                    type: "object",
                    required: ["userId", "recommendedBooks"],
                    properties: {
                        userId: { type: "string", example: "6890d8a7904558ba7cea90b8" },
                        recommendedBooks: {
                            type: "array",
                            items: { type: "string", example: "6890d975904558ba7cea90bb" }
                        }
                    }
                },
                UpdateRecommendationInput: {
                    type: "object",
                    properties: {
                        recommendedBooks: {
                            type: "array",
                            items: { type: "string", example: "6890d975904558ba7cea90bb" }
                        }
                    }
                }
            }
        }
    },
    apis: ["./routes/*.js"], // kjer boš dodala @swagger anotacije
};

const swaggerDocs = swaggerJsdoc(options);

export { swaggerUi, swaggerDocs };
