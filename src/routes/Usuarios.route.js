import { Router } from "express"
import  {actualizarUsuario,perfil, listarUsuarios, buscarUsuario, desactivarUsuario, registrarUsuarios,registrarEmpleados} from '../controllers/Usuarios.controller.js';
import {validarUsuario, validarUsu} from '../../validate/Usuariosvalidate.js'
import { validarToken  } from '../controllers/autenticacion.js'


const rutaUsuario = Router();

rutaUsuario.get('/listarUsuarios', validarToken,listarUsuarios);  
rutaUsuario.get('/listarPerfil', validarToken,perfil);  
rutaUsuario.post('/registrarUsuario' ,registrarUsuarios);
rutaUsuario.put('/desactivarUsuario/:identificacion',validarToken, desactivarUsuario);
rutaUsuario.put('/actualizarUsuario/:identificacion',validarToken,actualizarUsuario);
rutaUsuario.get('/buscarUsuarios/:identificacion',validarToken, buscarUsuario);

rutaUsuario.post('/registrarEmple', validarToken,registrarEmpleados);
export default rutaUsuario;
