import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import shelvesRoutes from "./routes/shelvesroutes.js";
import { swaggerUi, swaggerDocs } from "./swagger.js"; 
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/shelves", shelvesRoutes);
app.get("/", (_, res) => res.send("Shelves API OK"));

export default app;
