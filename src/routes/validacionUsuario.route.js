import { Router } from "express";
import { tokenPassword } from "../controllers/validacionUsuario.js"

const rutaPassword = Router();

rutaPassword.post('/passwordtoken', tokenPassword)
rutaPassword.post('/passwordtoken', )