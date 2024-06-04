import { check } from "express-validator";

// REGISTRAR
export const validarRR = [
    check('nombre_actividad').notEmpty().matches(/^[A-Za-zñÑ\s]+$/).withMessage('El campo de actividad solo debe contener letras y espacios').withMessage('El campo de actividad solo debe contener letras y espacios'),
    check('tiempo', 'El campo tiempo es obligatorio y debe tener el formato HH:MM:SS').not().isEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('observaciones', 'El campo de observaciones debe ser obligatorio y no puede tener más de 40 palabras').notEmpty().isString().matches(/^(\b\w+\b[\s\r\n]*){0,40}$/),
    check('fk_id_variedad', 'El campo de identificación de variedad debe ser un número entero').isInt(),
    check('fk_id_tipo_recursos', 'El campo de identificación de recursos debe ser un número entero').isInt(),
    check('valor_actividad', 'El campo de valor de actividad debe ser un número').isInt().isNumeric(),
   /*  check('observacion', 'El campo de observacion no puede tener más de 40 palabras').optional().matches(/^(\b\w+\b[\s\r\n]*){0,40}$/),
     */
   check('estado', 'El campo de estado debe ser "activo","proceso","terminado","inactivo"').isIn(['activo','proceso', 'terminado','inactivo'])

];

// ACTUALIZAR
export const validarRA = [
    check('nombre_actividad').optional().matches(/^[A-Za-zñÑ\s]+$/).withMessage('El campo de actividad solo debe contener letras'),
    check('tiempo', 'El campo de tiempo es obligatorio y debe tener el formato HH:MM:SS').optional().not().isEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('observaciones', 'El campo de observaciones no puede tener más de 40 palabras').optional().matches(/^(\b\w+\b[\s\r\n]*){0,40}$/),
    check('fk_id_variedad', 'El campo de identificación de variedad debe ser un número entero').optional().isNumeric(),
    check('fk_id_tipo_recursos', 'El campo de identificación de variedad debe ser un número entero').optional().isNumeric(),
    check('valor_actividad', 'El campo de valor de actividad debe ser un número decimal').optional().isNumeric(),
    check('observacion', 'El campo de observacion no puede tener más de 40 palabras').optional().matches(/^(\b\w+\b[\s\r\n]*){0,40}$/),
    check('estado', 'El campo de estado debe ser "activo","proceso","terminado","inactivo"').optional().isIn(['activo','proceso', 'terminado','inactivo'])
];

