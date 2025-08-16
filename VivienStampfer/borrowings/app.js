// app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import shelvesRoutes from "./routes/shelvesroutes.js";
import { swaggerUi, swaggerDocs } from "./swagger.js"; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/shelves", shelvesRoutes);
app.get("/", (_, res) => res.send("Shelves API OK"));

export default app;
