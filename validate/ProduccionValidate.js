import { check } from "express-validator";


export const ValidateProduccion = [
    check('cantidad_produccion', 'La cantidad debe ser un número y no ser menor a 1').isInt().isNumeric(),
    check('precio', 'El precio debe ser un número y mayor a 1').isInt().isNumeric(),
    check('fk_id_programacion', 'Este debe ser un número y no deve esta vacio').isNumeric().isInt()
];

export const actualizar =[
    check('cantidad_produccion','la cantidad tienen que ser un numero y no ser menos a 1').isInt().isNumeric().optional(),
    check('precio','el precio deve ser un numero y mayor a 1').isInt().isNumeric().optional(),
    check('fk_id_programacion','este deve un numero ').isNumeric().isInt().optional()
]