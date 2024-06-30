

import { check } from "express-validator";

//REGISTRAR
export const validarFincaR = [
    check('nombre_finca', 'El nombre de la finca es obligatorio y debe tener máximo 20 caracteres, y solo puede contener letras')
        .not().isEmpty().isLength({ max: 20 }).matches(/^[a-zA-ZñÑ\s]+$/),
    check('longitud', 'La longitud debe ser un dato obligatorio y debe ser un número válido entre -79.03 y -66.85')
        .isFloat({ min: -79.03, max: -66.85 }),
    check('latitud', 'La latitud debe ser un dato obligatorio y debe ser un número válido entre 4.22 y 12.45')
        .isFloat({ min: 4.22, max: 12.45 })
];


// ACTUALIZAR
//nn
export const validarFincaA = [
    check('nombre_finca', 'El nombre de la finca debe tener máximo 100 caracteres y solo puede contener letras y espacios')
        .optional({ nullable: true })
        .isLength({ max: 100 })
        .matches(/^[a-zA-ZñÑ\s]+$/),
    check('longitud', 'La longitud debe ser un número válido entre -79.03 y -66.85')
        .optional({ nullable: true })
        .isFloat({ min: -79.03, max: -66.85 }),  // Actualizado a rangos válidos para Colombia
    check('latitud', 'La latitud debe ser un número válido entre 4.22 y 12.45')
        .optional({ nullable: true })
        .isFloat({ min: 4.22, max: 12.45 })  // Actualizado a rangos válidos para Colombia
];
