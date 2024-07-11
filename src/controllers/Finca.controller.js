import { pool } from "../database/conexion.js";
import { validationResult } from 'express-validator';

//crud listar
//crid
export const listarFinca = async (req, res) => {
    try {
        // Obtener la identificación del administrador desde el token
        const adminId = req.usuario;

        if (!adminId) {
            return res.status(403).json({ message: 'No se proporcionó la identificación del administrador en el token' });
        }

        // Consultar las fincas del administrador actual
        const [result] = await pool.query("SELECT * FROM finca WHERE admin_id = ?", [adminId]);

        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No se encontraron fincas registradas por este administrador'
            });
        }
    } catch (error) {
        console.error("Error al listar fincas del administrador:", error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el sistema al listar fincas del administrador'
        });
    }
};


//crud Registrar
export const RegistroFinca = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const { nombre_finca, longitud, latitud } = req.body;

        // Obtener la identificación del administrador desde el token
        const admin_id = req.usuario
  

        // Modifica la consulta SQL para incluir el valor predeterminado del estado activo
        const [result] = await pool.query("INSERT INTO finca (nombre_finca, longitud, latitud, estado, admin_id) VALUES (?, ?, ?, 'activo', ?)", [nombre_finca, longitud, latitud, admin_id]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: 'Se registró la finca con éxito',
                result: result
            });
        } else {
            res.status(403).json({
                status: 403,
                message: 'No se registró la finca',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema'
        });
    }
}

export const ActualizarFinca = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const { id_finca } = req.params;
        const { nombre_finca, longitud, latitud } = req.body;

        // Obtener la identificación del administrador desde el token
        const admin_id = req.usuario;

        // Verifica si al menos uno de los campos está presente en la solicitud
        if (!nombre_finca && !longitud && !latitud) {
            return res.status(400).json({ message: 'Al menos uno de los campos (nombre_finca, longitud, latitud) debe estar presente en la solicitud para realizar la actualización.' });
        }

        // Consulta la finca existente para obtener su estado actual
        const [oldFinca] = await pool.query("SELECT * FROM finca WHERE id_finca=?", [id_finca]);

        // Actualiza la finca con los valores proporcionados y el admin_id del usuario autenticado
        const [result] = await pool.query(
            `UPDATE finca SET nombre_finca=?, longitud=?, latitud=?, admin_id=? WHERE id_finca=?`,
            [nombre_finca || oldFinca[0].nombre_finca, longitud || oldFinca[0].longitud, latitud || oldFinca[0].latitud, admin_id, id_finca]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se actualizó con éxito',
                result: result
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No se encontró el registro para actualizar'
            });
        }
    } catch (error) {
        console.error("Error en la función Actualizar:", error);
        return res.status(500).json({
            status: 500,
            message: error.message || "error en el sistema"
        });
    }
};


// CRUD - Buscar
export const BuscarFinca = async (req, res) => {
    try {
        const { id_finca } = req.params;
        const [result] = await pool.query("SELECT * FROM finca WHERE id_finca =?", [id_finca]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'No se encontraron resultados para la búsqueda'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "error en el sistema"
        });
    }
};

export const desactivarF = async (req, res) => {
    try {
        const { id_finca } = req.params;

        // Inicia una transacción
        await pool.query("START TRANSACTION");

        // Consulta la finca por su ID
        const [finca] = await pool.query("SELECT * FROM finca WHERE id_finca = ?", [id_finca]);

        // Verifica si se encontró la finca
        if (finca.length === 0) {
            await pool.query("ROLLBACK"); // Si no se encontró, deshace la transacción
            return res.status(404).json({
                status: 404,
                message: 'Finca no encontrada',
            });
        }

        // Determina el nuevo estado
        let nuevoEstado;
        if (finca[0].estado === 'activo') {
            nuevoEstado = 'inactivo'; // Si estaba activo, se desactiva
        } else {
            nuevoEstado = 'activo'; // Si estaba inactivo, se activa
        }

        // Actualiza el estado de la finca
        await pool.query("UPDATE finca SET estado = ? WHERE id_finca = ?", [nuevoEstado, id_finca]);

        // Actualiza el estado de los lotes relacionados
        await pool.query("UPDATE lotes SET estado = ? WHERE fk_id_finca = ?", [nuevoEstado, id_finca]);

     
    
        // Actualiza el estado de los cultivos relacionados
        await pool.query("UPDATE cultivo SET estado = ? WHERE fk_id_lote IN (SELECT id_lote FROM lotes WHERE fk_id_finca = ?)", [nuevoEstado, id_finca]);

        // Actualiza el estado de las programaciones relacionadas
        await pool.query("UPDATE programacion SET estado = ? WHERE fk_id_lote IN (SELECT id_lote FROM lotes WHERE fk_id_finca = ?)", [nuevoEstado, id_finca]);

        // Actualiza el estado de las actividades relacionadas
        await pool.query("UPDATE actividad SET estado = ? WHERE id_actividad IN (SELECT fk_id_actividad FROM programacion WHERE fk_id_lote IN (SELECT id_lote FROM lotes WHERE fk_id_finca = ?))", [nuevoEstado, id_finca]);

        // Confirma la transacción
        await pool.query("COMMIT");

        res.status(200).json({
            status: 200,
            message: `Estado de la finca y tablas relacionadas actualizados a ${nuevoEstado}`,
        });
    } catch (error) {
        // Si ocurre un error, deshace la transacción
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema',
        });
    }
};

export const listarSumaFincas = async (req, res) => {
    try {
        const adminId = req.usuario;

        if (!adminId) {
            return res.status(403).json({ message: 'No se proporcionó la identificación del administrador en el token' });
        }

        const [result] = await pool.query("SELECT COUNT(*) as totalFincas FROM finca WHERE admin_id = ?", [adminId]);

        if (result.length > 0) {
            return res.status(200).json({ totalFincas: result[0].totalFincas });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No se encontraron fincas registradas por este administrador'
            });
        }
    } catch (error) {
        console.error("Error al listar la suma de fincas del administrador:", error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el sistema al listar la suma de fincas del administrador'
        });
    }
};
