
import { Router } from "express";
import { listarFinca, RegistroFinca, ActualizarFinca, BuscarFinca, desactivarF } from "../controllers/Finca.controller.js";
 import { validarFincaA } from "../../validate/Finca_validate.js";
import { validarFincaR } from "../../validate/Finca_validate.js"; 
import { validarToken } from "../controllers/autenticacion.js";

const router = Router();

router.get("/listarFinca", validarToken, listarFinca);
router.post("/RegistroFinca", validarToken,  validarFincaR,  RegistroFinca);
router.put("/actualizarFinca/:id_finca", validarToken,  validarFincaA,  ActualizarFinca);
router.get("/buscarFinca/:id_finca",  BuscarFinca);
router.put("/desactivarFinca/:id_finca", validarToken,  validarFincaA , desactivarF);

export default router;
//nn