import { check, body } from 'express-validator';

// Validaciones para el registro de Tipo de Recurso
export const validarRer = [
    check('nombre_recursos', 'El nombre del recurso es obligatorio y debe tener máximo 20 caracteres')
    .not().isEmpty().isLength({ max: 20 }),

    check('cantidad_medida', 'La cantidad de medida es obligatoria y debe ser un número válido')
        .not().isEmpty().isNumeric(),
    check('unidades_medida', 'Las unidades de medida son obligatorias y deben ser ml, litro, g, kg o unidad')
        .not().isEmpty().isIn(['ml', 'litro', 'g', 'kg','unidad']),
    body('extras').optional().escape()
];

// Validaciones para la actualización de Tipo de Recurso
export const validarRea = [
    check('nombre_recursos', 'El nombre del recurso debe tener máximo 60 caracteres y puede contener cualquier tipo de carácter')
    .optional({ nullable: true })
    .isLength({ max: 20 }),
    check('cantidad_medida', 'La cantidad de medida debe ser un número válido')
        .optional({ nullable: true })
        .isNumeric(),
    check('unidades_medida', 'Las unidades de medida deben ser ml, litro, g, kg o unidad')
        .optional({ nullable: true })
        .isIn(['ml', 'litro', 'g', 'kg', 'unidad']),
    body('extras').optional().escape()
];
