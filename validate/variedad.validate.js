import { check } from "express-validator";

export const validarRegistroVariedad = [
    check('nombre_variedad', 'El Nombre de la variedad es obligatorio y debe tener máximo 20 caracteres, y solo debe contener letras')
    .not().isEmpty().withMessage('El nombre de la variedad es obligatorio')
    .isLength({ max: 20 }).withMessage('El nombre de la variedad debe tener máximo 20 caracteres')
    .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre de la variedad solo debe contener letras'),

    check('tipo_cultivo', 'El tipo de cultivo debe ser uno de los siguientes valores: alimentarios, textiles, oleaginosos, ornamentales, industriales')
    .not().isEmpty().withMessage('El tipo de cultivo es obligatorio')
    .isIn(['alimentarios', 'textiles', 'oleaginosos', 'ornamentales', 'industriales']).withMessage('El tipo de cultivo no es válido')
];

//validación para actualizar la variedad de un cultivo
export const validarActualizacionVariedad = [
    check('nombre_variedad', 'El nombre de la variedad debe tener máximo 20 caracteres, y solo puede contener letras y espacios')
    .optional().isLength({ max: 20 }).withMessage('El nombre de la variedad debe tener máximo 20 caracteres')
    .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre de la variedad solo debe contener letras y espacios'),

    check('tipo_cultivo', 'El tipo de cultivo debe ser uno de los siguientes valores: alimentarios, textiles, oleaginosos, ornamentales, industriales')
    .optional().isIn(['alimentarios', 'textiles', 'oleaginosos', 'ornamentales', 'industriales']).withMessage('El tipo de cultivo no es válido')
];
