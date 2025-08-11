import express from "express";
import morgan from "morgan";
import cors from "cors";
import obvestiloRoutes from "./routes/obvestiloroutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/obvestila", obvestiloRoutes);
app.get("/", (req,res)=>res.send("API Obvestila deluje"));
export default app;
