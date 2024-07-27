import { Router } from "express";
import {  listarEmpleado, RegistrarE,Empleado,registrarEvidencia } from "../controllers/Empleado.controller.js";
import { validarRR } from "../../validate/Empleadovalidate.js";
import {validarToken} from "../controllers/autenticacion.js";
import upload from "../controllers/carga.Img.js";

const rutaDeEmpleado = Router()

//localhost:3000/empleadosssss
rutaDeEmpleado.get("/Listar",validarToken, listarEmpleado); 
rutaDeEmpleado.post("/Registrar/:id_actividad",validarToken, RegistrarE);
rutaDeEmpleado.put("/cambioestado/:id_actividad",validarToken,  Empleado);
rutaDeEmpleado.post('/registrarEvidencia/:idActividad', upload.array('imagenes', 10), registrarEvidencia);


export default rutaDeEmpleado;