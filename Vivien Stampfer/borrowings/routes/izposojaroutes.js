import { Router } from "express";
import {
  seznamIzposoj, enaIzposoja, dodajIzposojo, posodobiIzposojo, izbrisiIzposojo
} from "../controllers/izposoja.controller.js";

const r = Router();

r.get("/", seznamIzposoj);       
r.get("/:id", enaIzposoja);       
r.post("/", dodajIzposojo);        
r.put("/:id", posodobiIzposojo);    
r.delete("/:id", izbrisiIzposojo);  

export default r;
