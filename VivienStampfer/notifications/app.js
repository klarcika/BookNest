import express from "express";
import morgan from "morgan";
import cors from "cors";
import obvestiloRoutes from "./routes/obvestiloroutes.js";
import { swaggerUi, swaggerDocs } from "./swagger.js";

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.use("/obvestila", obvestiloRoutes);
app.get("/", (req, res) => res.send("API Obvestila deluje"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default app;
