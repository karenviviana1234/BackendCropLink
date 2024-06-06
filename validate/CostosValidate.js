import { check } from "express-validator";

export const validacionCostosR = [
    check('precio').notEmpty().withMessage('El precio es obligatoria').isNumeric().withMessage('El precio  debe ser un número'),
    check('fk_id_tipo_recursos').notEmpty().withMessage('La fk es obligatoria').isNumeric().withMessage('La fk  debe ser un número'),
    
]

export const validacionCostosA = [
    check('precio').optional().isNumeric().withMessage('El precio debe ser un número'),
    check('fk_id_tipo_recursos').optional().isNumeric().withMessage('La fk debe ser un número'),
];
