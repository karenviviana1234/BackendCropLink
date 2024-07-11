import { check } from "express-validator"


export const validarlotes=[
        check('nombre', 'El nombre es obligatorio').notEmpty().isLength({ max: 100 }),
        check('longitud', 'La longitud debe ser un dato obligatorio y debe ser un número válido entre -79.03 y -66.85')
        .isFloat({ min: -79.03, max: -66.85 }),
    check('latitud', 'La latitud debe ser un dato obligatorio y debe ser un número válido entre 4.22 y 12.45')
        .isFloat({ min: 4.22, max: 12.45 }),
        check('fk_id_finca', 'El ID de la finca es obligatorio y debe ser un número entero').notEmpty().isInt()
    ];
//nn

export const validarlotesactualizar=[
            
    check('nombres','es obligatorio').isEmpty().isLength({max:100}) .optional(),
    check('longitud', 'La longitud debe ser un número válido entre -79.03 y -66.85')
        .optional({ nullable: true })
        .isFloat({ min: -79.03, max: -66.85 }),  // Actualizado a rangos válidos para Colombia
    check('latitud', 'La latitud debe ser un número válido entre 4.22 y 12.45')
        .optional({ nullable: true })
        .isFloat({ min: 4.22, max: 12.45 }),  // Actualizado a rangos válidos para Colombia,
    check('fk_id_finca','es obligartorio el fk_id_finca').isInt() .optional(),
    ]
    