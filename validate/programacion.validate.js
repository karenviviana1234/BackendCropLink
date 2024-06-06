import { check } from "express-validator";

// Registrar Asignación
export const programacionC = [
    check('fecha_inicio', 'La fecha de la programacion debe ser YYYY-MM-DD').notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/),
    check('fecha_fin', 'La fecha de la programacion debe ser YYYY-MM-DD').notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/),
    check('fk_identificacion', 'El campo de clave foránea debe contener solo números naturales').notEmpty().isInt(), 
    check('fk_id_actividad', 'El campo de clave foránea debe contener solo números naturales o el fk_id_actividad no existe').notEmpty().isInt(),
    check('fk_id_variedad', 'El campo de clave foránea debe contener solo números naturales o el fk_id_cultivo no existe').notEmpty().isNumeric(),
    check('estado', 'El campo de estado debe ser "activo", "proceso", "terminado" o "inactivo"').isIn(['activo', 'proceso', 'terminado', 'inactivo']),

];


// Actualizar Asignación
export const programacionA = [
    check('fecha_inicio', 'La fecha de la programacion debe ser YYYY-MM-DD, y no puede contener letras y barras').not().isEmpty().optional().isLength({ max: 20 }).matches(/^\d{4}-\d{2}-\d{2}$/),
    check('fecha_fin', 'La fecha de la programacion debe ser YYYY-MM-DD, y no puede contener letras y barras').not().isEmpty().optional().isLength({ max: 20 }).matches(/^\d{4}-\d{2}-\d{2}$/),
    check('fk_identificacion', 'El campo de clave foránea debe contener solo números naturales o el fk_id_usuario no existe').isNumeric(),
    check('fk_id_actividad', 'El campo de clave foránea debe contener solo números naturales o el fk_id_actividad no existe').isNumeric(),
    check('fk_id_variedad', 'El campo de clave foránea debe contener solo números naturales o el fk_id_cultivo no existe').isNumeric(),
    check('estado', 'El campo de estado debe ser "activo","proceso","terminado","inactivo"').optional().isIn(['activo','proceso', 'terminado','inactivo'])
];

//nn