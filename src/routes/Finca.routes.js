
import { Router } from "express";
import { listarFinca, RegistroFinca, ActualizarFinca, BuscarFinca, desactivarF, listarSumaFincas } from "../controllers/Finca.controller.js";
 import { validarFincaA } from "../../validate/Finca_validate.js";
import { validarFincaR } from "../../validate/Finca_validate.js"; 
import { validarToken } from "../controllers/autenticacion.js";

const rutaFinca = Router();

rutaFinca.get("/listarFinca", validarToken, listarFinca);
rutaFinca.post("/RegistroFinca", validarToken,  validarFincaR,  RegistroFinca);
rutaFinca.put("/actualizarFinca/:id_finca", validarToken,  validarFincaA,  ActualizarFinca);
rutaFinca.get("/buscarFinca/:id_finca",  BuscarFinca);
rutaFinca.put("/desactivarFinca/:id_finca", validarToken,  validarFincaA , desactivarF);
rutaFinca.get("/sumaFincas", validarToken,  validarFincaA , listarSumaFincas);

export default rutaFinca;
//nn