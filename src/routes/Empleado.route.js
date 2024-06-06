import { Router } from "express";
import {  listarEmpleado, RegistrarE,Empleado } from "../controllers/Empleado.controller.js";
import { validarRR } from "../../validate/Empleadovalidate.js";

import {validarToken} from "../controllers/autenticacion.js";


const rutaDeEmpleado = Router()

//localhost:3000/empleadosssss
 rutaDeEmpleado.get("/Listar",validarToken, listarEmpleado); 
rutaDeEmpleado.put("/EmpleadoMood/Registrar/:id",validarToken,validarRR, RegistrarE);
rutaDeEmpleado.put("/cambioestado/:id_actividad",  Empleado);


export  {rutaDeEmpleado} ;