import { check } from "express-validator";

export const validarUsuario = [
    check('identificacion', 'Identificacion es obligatorio y debe contener solo números')
    .not()
    .isEmpty()
    .isNumeric(),

    check('nombre', 'El nombre es obligatorio y debe contener solo letras, máximo 50 caracteres')
        .not()
        .isEmpty()
        .isLength({ max: 20 })
        .matches(/^[A-Za-z\s]+$/),

    check('apellido', 'El apellido es obligatorios y debe contener solo letras, máximo 50 caracteres')
        .not()
        .isEmpty()
        .isLength({ max: 50 })
        .matches(/^[A-Za-z\s]+$/),

        check('rol', 'Rol no existe')
        .optional()
        .not().isEmpty()
        .isIn(["administrador", "empleado"])
   
];

    

    export const validarUsu = [
        check('identificacion', 'Identificacion es obligatorio y debe contener solo números')
        .optional()
        .not()
        .isEmpty()
        .isNumeric(),

        check('nombre', 'El nombre es obligatorio y debe contener solo letras, máximo 50 caracteres')
        .optional()
            .not().isEmpty()
            .isLength({ max: 50 })
            .matches(/^[A-Za-z\s]+$/),
    
            check('apellido', 'El apellido es obligatorio y debe contener solo letras, máximo 50 caracteres')
            .optional()
            .not().isEmpty()
            .isLength({ max: 50 })
            .matches(/^[A-Za-z\s]+$/),
    
        check('rol', 'Rol no existe')
            .optional()
            .not().isEmpty()
            .isIn(["administrador", "empleado"])
       
    ];
    //nn