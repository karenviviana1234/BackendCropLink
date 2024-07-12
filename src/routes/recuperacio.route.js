import { Router } from "express";
import { sendPasswordByEmail} from "../controllers/recuperacionC.js";

const rutaDeRecu = Router()
//rutaDeRecu.get("/listara",validarToken, listarA);

rutaDeRecu.post("/Recu",sendPasswordByEmail);

export { rutaDeRecu };
