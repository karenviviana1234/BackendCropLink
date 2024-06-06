import { Router } from "express";
import {registrar,  actualizar,  buscar, listar, desactivar } from '../controllers/Cultivos.controller.js';
import { validacionCultivosA, validacionCultivosR } from "../../validate/CultivoValidate.js";
import { validarToken } from "../controllers/autenticacion.js"; 


const rutaCultivos = Router();

rutaCultivos.get('/listarCultivos',  validarToken,  listar);
rutaCultivos.post('/registrarCultivos',  validarToken ,validacionCultivosR, registrar);
rutaCultivos.get('/buscarCultivos/:id_cultivo', validarToken, buscar); 
rutaCultivos.put('/actualizarCultivos/:id_cultivo',  validarToken,  validacionCultivosA, actualizar);
rutaCultivos.put('/desactivarCultivos/:id_cultivo', validarToken,  desactivar);


export default rutaCultivos;