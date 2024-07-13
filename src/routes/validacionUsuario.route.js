import { Router } from "express";
import {
    resetPassword,
    tokenPassword,

} from "../controllers/validacionUsuario.js";

const routepassword = Router();


routepassword.post("/recuperar", tokenPassword);
routepassword.put("/cambiar", resetPassword);

export default routepassword;