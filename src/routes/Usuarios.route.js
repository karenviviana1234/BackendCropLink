import { Router } from "express"
import  {actualizarUsuario,perfil, listarUsuarios, buscarUsuario, desactivarUsuario, registrarUsuarios,registrarEmpleados, actualizarPerfil, obtenerTotalEmpleados} from '../controllers/Usuarios.controller.js';
import {validarUsuario, validarUsu} from '../../validate/Usuariosvalidate.js'
import { validarToken  } from '../controllers/autenticacion.js'


const rutaUsuario = Router();

rutaUsuario.get('/listarUsuarios', validarToken,listarUsuarios);  
rutaUsuario.get('/listarPerfil', validarToken,perfil);  
rutaUsuario.post('/registrarUsuario' ,registrarUsuarios);
rutaUsuario.put('/desactivarUsuario/:identificacion',validarToken, desactivarUsuario);
rutaUsuario.put('/actualizarUsuario/:idAentificacion',validarToken,actualizarUsuario);
rutaUsuario.get('/buscarUsuarios/:identificacion',validarToken, buscarUsuario);
rutaUsuario.put('/actualizarPerfil/:identificacion',validarToken, actualizarPerfil);
rutaUsuario.get('/sumaEmpleados',validarToken, obtenerTotalEmpleados);

rutaUsuario.post('/registrarEmple', validarToken,registrarEmpleados);
export default rutaUsuario;
