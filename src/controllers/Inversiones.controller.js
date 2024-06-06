import { pool } from "../database/conexion.js";
import { validationResult } from 'express-validator';

export const listarInversiones = async (req, res) => {
    try {
        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;

        let sql = `
            SELECT 
            inver.*,
                inver.id_inversiones AS id_inversiones,
                l.nombre AS nombre_lote, 
                cu.id_cultivo,
                cu.fecha_inicio AS fecha_siembra_cultivo,
                cu.cantidad_sembrada,
                v.nombre_variedad AS nombre_variedad,
                pro.fecha_inicio AS pro_fecha_inicio, 
                pro.fecha_fin AS pro_fecha_fin, 
                inver.fk_id_programacion AS id_programacion, 
                inver.fk_id_costos AS id_costos, 
                c.precio AS recur_precio, 
                tr.cantidad_medida AS recur_cantidad_medida, 
                SUM(a.valor_actividad) AS valor_actividad, 
                (c.precio * tr.cantidad_medida + SUM(a.valor_actividad)) AS valor_inversion
            FROM 
                inversiones AS inver
                JOIN programacion AS pro ON inver.fk_id_programacion = pro.id_programacion
                JOIN lotes AS l ON pro.fk_id_lote = l.id_lote
                JOIN cultivo AS cu ON l.id_lote = cu.fk_id_lote
                JOIN variedad AS v ON cu.fk_id_variedad = v.id_variedad
                JOIN costos AS c ON inver.fk_id_costos = c.id_costos
                JOIN tipo_recursos AS tr ON c.fk_id_tipo_recursos = tr.id_tipo_recursos
                JOIN actividad AS a ON pro.fk_id_actividad = a.id_actividad
            WHERE 
                pro.admin_id = ?
            GROUP BY 
                inver.id_inversiones`;

        const [result] = await pool.query(sql, [adminId]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ status: 400, message: 'No hay ninguna inversión' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en el servidor: ' + error });
    }
};



export const registrarInversiones = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fk_id_programacion, fk_id_costos } = req.body;

        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;

        // Verificar si el costo existe
        const [costoExist] = await pool.query('SELECT * FROM costos WHERE id_costos = ?', [fk_id_costos]);

        if (costoExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'El ID de costo no existe. Registre primero un costo.'
            });
        }

        // Verificar si la programación existe y pertenece al adminId
        const [programacionExist] = await pool.query('SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?', [fk_id_programacion, adminId]);

        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'La programación no existe o no está autorizada para este administrador. Registre primero una programación.'
            });
        }

        // Obtener información del costo y tipo de recurso
        const [costoInfo] = await pool.query('SELECT precio FROM costos WHERE id_costos = ?', [fk_id_costos]);
        const [tipoRecursoInfo] = await pool.query('SELECT cantidad_medida FROM tipo_recursos WHERE id_tipo_recursos = ?', [fk_id_costos]);

        const precio = costoInfo[0].precio;
        const cantidadMedida = tipoRecursoInfo[0].cantidad_medida;
        const valor_inversion = precio * cantidadMedida;

        // Insertar la inversión
        const [Registrar] = await pool.query('INSERT INTO inversiones (fk_id_programacion, fk_id_costos, valor_inversion, admin_id) VALUES (?, ?, ?, ?)', [fk_id_programacion, fk_id_costos, valor_inversion, adminId]);

        if (Registrar.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: 'Se registró correctamente la inversión.'
            });
        } else {
            res.status(400).json({
                status: 400,
                message: 'No se pudo registrar la inversión.'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};



export const actualizarInversiones = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_inversiones } = req.params;
        const { fk_id_costos, fk_id_programacion } = req.body;

        // Verificar si la inversión existe
        const [inversionExist] = await pool.query('SELECT * FROM inversiones WHERE id_inversiones = ?', [id_inversiones]);

        if (inversionExist.length === 0) {
            return res.status(404).json({ status: 404, message: 'La inversión no se encontró.' });
        }

        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;

        // Verificar si el costo existe y pertenece al administrador
        if (fk_id_costos) {
            const [costoExist] = await pool.query('SELECT * FROM costos WHERE id_costos = ? AND admin_id = ?', [fk_id_costos, adminId]);
            if (costoExist.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'El ID de costo no existe o no está autorizado para este administrador. Registre primero un costo.'
                });
            }
        }

        // Verificar si la programación existe y pertenece al administrador
        if (fk_id_programacion) {
            const [programacionExist] = await pool.query('SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?', [fk_id_programacion, adminId]);
            if (programacionExist.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'El ID de programación no existe o no está autorizado para este administrador. Registre primero una programación.'
                });
            }
        }

        const updateValues = {
            fk_id_costos: fk_id_costos || inversionExist[0].fk_id_costos,
            fk_id_programacion: fk_id_programacion || inversionExist[0].fk_id_programacion
        };

        const updateQuery = 'UPDATE inversiones SET fk_id_costos=?, fk_id_programacion=? WHERE id_inversiones=?';

        const [result] = await pool.query(updateQuery, [updateValues.fk_id_costos, updateValues.fk_id_programacion, id_inversiones]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: 'La inversión ha sido actualizada.'
            });
        } else {
            res.status(400).json({
                status: 400,
                message: 'No se encontraron resultados para la actualización.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor.',
            error: error.message
        });
    }
};


export const BuscarInversiones = async (req, res) => {
    try {
        const { id_inversiones } = req.params;
        const consultar = `
        SELECT 
            inver.id_inversiones AS id_inversiones,
            l.nombre AS nombre_lote, 
            cu.id_cultivo,
            cu.fecha_inicio AS fecha_siembra_cultivo,
            cu.cantidad_sembrada,
            v.nombre_variedad AS nombre_variedad,
            pro.fecha_inicio AS pro_fecha_inicio, 
            pro.fecha_fin AS pro_fecha_fin, 
            inver.fk_id_programacion AS id_programacion, 
            inver.fk_id_costos AS id_costos, 
            c.precio AS recur_precio, 
            tr.cantidad_medida AS recur_cantidad_medida, 
            SUM(a.valor_actividad) AS valor_actividad, 
            (c.precio * tr.cantidad_medida + SUM(a.valor_actividad)) AS valor_inversion
        FROM 
            inversiones AS inver 
            JOIN programacion AS pro ON inver.fk_id_programacion = pro.id_programacion 
            JOIN lotes AS l ON pro.fk_id_lote = l.id_lote
            JOIN cultivo AS cu ON l.id_lote = cu.fk_id_lote
            JOIN variedad AS v ON cu.fk_id_variedad = v.id_variedad
            JOIN costos AS c ON inver.fk_id_costos = c.id_costos 
            JOIN tipo_recursos AS tr ON c.fk_id_tipo_recursos = tr.id_tipo_recursos 
            JOIN actividad AS a ON pro.fk_id_actividad = a.id_actividad
        WHERE 
            inver.id_inversiones = ?
        GROUP BY 
            inver.id_inversiones`;
        
        const [resultado] = await pool.query(consultar, [id_inversiones]);

        if (resultado.length > 0) {
            // Recalcular el valor de inversión
            resultado[0].valor_inversion = resultado[0].recur_precio * resultado[0].recur_cantidad_medida + resultado[0].valor_actividad;
            res.status(200).json(resultado[0]);
        } else {
            res.status(404).json({
                status: 404,
                message: "No se encontraron resultados",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error en el servidor",
            error: error.message,
        });
    }
};