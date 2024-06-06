import { check } from "express-validator"


export const validarlotes=[
        check('nombre', 'El nombre es obligatorio').notEmpty().isLength({ max: 100 }),
        check('longitud', 'La longitud es obligatoria y debe estar entre -180 y 180').notEmpty().isFloat({ min: -180, max: 180 }),
        check('latitud', 'La latitud es obligatoria y debe estar entre -80 y 90').notEmpty().isFloat({ min: -80, max: 90 }),
        check('fk_id_finca', 'El ID de la finca es obligatorio y debe ser un número entero').notEmpty().isInt()
    ];
//nn

export const validarlotesactualizar=[
            
    check('nombres','es obligatorio').isEmpty().isLength({max:100}) .optional(),
    check('longitud','es obligatorio') .isFloat({ min: -180, max: 180 }) .optional(),
    check('latitud','es obligatorio') .isFloat({ min: -80, max: 90 }) .optional(),
    check('fk_id_finca','es obligartorio el fk_id_finca').isInt() .optional(),
    ]
    