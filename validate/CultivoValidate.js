import { check } from "express-validator";

export const validacionCultivosR = [
    check('fecha_inicio').notEmpty().withMessage('La  es fecha es obligatoria').isISO8601().withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)'),
    check('cantidad_sembrada').notEmpty().withMessage('La cantidad es obligatoria').isNumeric().withMessage('La cantidad  debe ser un número'),
    check('fk_id_lote').notEmpty().withMessage('La fk es obligatoria').isNumeric().withMessage('La fk  debe ser un número'),
    check('fk_id_variedad').notEmpty().withMessage('La fk es obligatoria').isNumeric().withMessage('La fk  debe ser un número')
   /*  check('estado').notEmpty().withMessage('El estado es obligatorio').isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
     */
]

export const validacionCultivosA = [
    check('fecha_inicio').optional().isISO8601().withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)'),
    check('cantidad_sembrada').optional().isNumeric().withMessage('La cantidad debe ser un número'),
    check('fk_id_lote').optional().isNumeric().withMessage('La fk debe ser un número'),
    check('fk_id_variedad').optional().isNumeric().withMessage('La fk debe ser un número'),
   /*   check('estado').optional().isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
  */
];
