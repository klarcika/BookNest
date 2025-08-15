import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Katalog API",
            version: "1.0.0",
            description: "API za upravljanje z uporabniki.",
        },
        servers: [
            {
                url: "http://localhost:3030",
            },
        ],
        components: {
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        username: { type: "string", example: "john_doe" },
                        email: { type: "string", example: "john@example.com" },
                        passwordHash: { 
                            type: "string", 
                            example: "$2b$10$abc123hashedpassword" 
                        },
                        preferences: {
                            type: "object",
                            properties: {
                                genrePreferences: {
                                    type: "array",
                                    items: { type: "string" },
                                    example: ["Fantasy", "Science Fiction"]
                                },
                                notificationSettings: {
                                    type: "boolean",
                                    example: true
                                }
                            }
                        },
                        profile: {
                            type: "object",
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                avatarUrl: { 
                                    type: "string", 
                                    format: "uri", 
                                    example: "https://example.com/avatar.jpg" 
                                },
                                bio: { type: "string", example: "Avid book lover and writer." }
                            }
                        },
                        createdAt: { type: "string", format: "date-time", example: "2025-08-14T10:00:00Z" },
                        updatedAt: { type: "string", format: "date-time", example: "2025-08-15T15:30:00Z" }
                    }
                }
            }
        }
    },
    apis: ["./router/*.js"],
};

const swaggerDocs = swaggerJsdoc(options);

export { swaggerUi, swaggerDocs };
