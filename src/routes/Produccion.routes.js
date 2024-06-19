import { Router } from "express";

import {  actualizarProduccion, desactivarProduccion, listarProduccion, registrarProduccion, } from "../controllers/Produccion.controller.js";
import { ValidateProduccion, actualizar } from "../../validate/ProduccionValidate.js";
import { validarToken } from "../controllers/autenticacion.js";


const rutaProduccion = Router()

rutaProduccion.get('/listarProduccion',validarToken,listarProduccion);
rutaProduccion.post('/RegistraProduccion',validarToken, ValidateProduccion,registrarProduccion);
rutaProduccion.put('/desactivarProduccion/:id_producccion', validarToken, desactivarProduccion);
rutaProduccion.put('/ActualizarProduccion/:id_producccion',validarToken,actualizar,actualizarProduccion);
export default rutaProduccion;


