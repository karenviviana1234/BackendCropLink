import { Router } from "express";
import {registrarCostos,  actualizar,  buscar, listarCostos, desactivarcosto } from '../controllers/Costos.controller.js';
import { validacionCostosA, validacionCostosR } from "../../validate/CostosValidate.js";
import { validarToken } from "../controllers/autenticacion.js"; 


const rutaCostos = Router();

rutaCostos.get('/listarCostos',  validarToken,  listarCostos);
rutaCostos.post('/registrarCostos',  validarToken,  validacionCostosR, registrarCostos);
rutaCostos.get('/buscarCostos/:id_costos',  validarToken,  buscar); 
rutaCostos.put('/actualizarCostos/:id_costos', validarToken,  validacionCostosA, actualizar);
rutaCostos.put('/desactivarCostos/:id_costos', validarToken, desactivarcosto);

export default rutaCostos;