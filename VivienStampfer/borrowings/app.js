import express from "express";
import morgan from "morgan";
import cors from "cors";
import izposojaRoutes from "./routes/izposojaroutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/izposoje", izposojaRoutes);
app.get("/", (req,res)=>res.send("API Izposoja deluje"));
export default app;
