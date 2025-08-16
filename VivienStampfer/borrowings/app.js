const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
import shelvesRoutes from "./routes/shelvesroutes.js";
import { swaggerUi, swaggerDocs } from "./swagger.js"; 

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
