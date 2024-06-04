import { check } from "express-validator";

// REGISTRAR empleadp
export const validarRR = [
    check('observacion', 'El campo de observacion es obligatorio y debe tener máximo 40 palabras').matches(/^(\s*\S+\s*){1,40}$/),
 ];
 