import { Router } from "express";
import { registrarVariedad, listarVariedades, actualizarVariedad,  buscarVariedad, desactivarVariedad } from "../controllers/variedad.controller.js";
import { validarRegistroVariedad, validarActualizacionVariedad } from "../../validate/variedad.validate.js";

import {validarToken} from "../controllers/autenticacion.js";

const rutaDeVariedad = Router();
//rutas de variedad de cultivo
rutaDeVariedad.post("/registrarVariedad",validarToken, validarRegistroVariedad, registrarVariedad);
rutaDeVariedad.get("/listarVariedades",validarToken, listarVariedades);
rutaDeVariedad.put("/actualizarVariedad/:id",validarToken, validarActualizacionVariedad, actualizarVariedad);
rutaDeVariedad.get("/buscarVariedad/:id",validarToken, buscarVariedad);
rutaDeVariedad.put("/desactivarvariedad/:id_variedad",validarToken, desactivarVariedad);
/* rutaDeVariedad.put("/desactivarVariedad/:id_variedad",validarToken, desactivarvariedad); */
export default rutaDeVariedad;


