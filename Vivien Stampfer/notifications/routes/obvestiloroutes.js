import { Router } from "express";
import {
  seznamObvestil, enoObvestilo, dodajObvestilo, posodobiObvestilo, izbrisiObvestilo
} from "../controllers/obvestilo.controller.js";

const r = Router();

r.get("/", seznamObvestil);            
r.get("/:id", enoObvestilo);          
r.post("/", dodajObvestilo);         
r.put("/:id", posodobiObvestilo);     
r.delete("/:id", izbrisiObvestilo);  

export default r;
