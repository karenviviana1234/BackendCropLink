import { Router } from "express";
import { listarTipoRecurso, RegistroTipoRecurso, ActualizarTipoRecurso, BuscarTipoRecurso, DesactivarR 
} from "../controllers/TipoRecurso.controller.js";
import { validarRer } from "../../validate/TipoRecursoValidate.js";
import { validarRea } from "../../validate/TipoRecursoValidate.js";

import { validarToken } from "../controllers/autenticacion.js";

const rutaDeTipoRecurso = Router()

//localhost:4000/VariedadCultivo
rutaDeTipoRecurso.get("/listarRecurso", validarToken, listarTipoRecurso);
rutaDeTipoRecurso.post("/RegistroRecurso", validarToken,validarRer,  RegistroTipoRecurso);
rutaDeTipoRecurso.put("/actualizarRecurso/:id",validarToken ,validarRea, ActualizarTipoRecurso); 
rutaDeTipoRecurso.put("/desactivarRecurso/:id",validarToken, DesactivarR); 
rutaDeTipoRecurso.get("/buscarRecurso/:id", validarToken, BuscarTipoRecurso);

export  default rutaDeTipoRecurso ;

//crud