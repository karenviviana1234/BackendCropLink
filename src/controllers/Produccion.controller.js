import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

export const listarProduccion = async (req,res) => {

    try {
        const identificacion = req.usuario;

        const [fincas] = await pool.query(`
            SELECT f.id_finca, f.nombre_finca
            FROM finca f
            WHERE f.admin_id = ?
        `, [identificacion]);

        if (fincas.length === 0) {
            return res.status(404).json({ message: 'El usuario no tiene fincas registradas.' });
        }

        let producciones = [];

        for (const finca of fincas) {
            const [result] = await pool.query(`
                SELECT p.id_producccion, p.cantidad_produccion, p.precio, p.valor_inversion, p.fk_id_programacion, p.fk_id_cultivo, p.estado, p.admin_id
                FROM produccion p
                JOIN programacion pr ON p.fk_id_programacion = pr.id_programacion
                JOIN lotes l ON pr.fk_id_lote = l.id_lote
                WHERE l.fk_id_finca = ? AND p.admin_id = ?
            `, [finca.id_finca, identificacion]);

            producciones = producciones.concat(result);
        }

        res.json(producciones);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las producciones del usuario.' });
    }
};


export const sumarProducciones = async (req, res) => {
    try {
      const identificacion = req.usuario;
      const [fincas] = await pool.query('SELECT id_finca, nombre_finca FROM finca WHERE estado = "activo"');


      const resultados = await Promise.all(fincas.map(async (finca) => {
        const [lotes] = await pool.query('SELECT id_lote FROM lotes WHERE fk_id_finca = ? AND estado = "activo"', [finca.id_finca]);
  
        let totalPrecio = 0;
        let totalValorInversion = 0;
  
        for (const lote of lotes) {
          const [programaciones] = await pool.query('SELECT id_programacion FROM programacion WHERE fk_id_lote = ? AND estado = "activo"', [lote.id_lote]);
  
          for (const programacion of programaciones) {
            const [producciones] = await pool.query('SELECT precio, valor_inversion FROM produccion WHERE fk_id_programacion = ? AND estado = "activo"', [programacion.id_programacion]);
  
            producciones.forEach(produccion => {
              totalPrecio += produccion.precio;
              totalValorInversion += produccion.valor_inversion;
            });
          }
        }

        const [usuario] = await pool.query('SELECT nombre, apellido FROM usuarios WHERE identificacion = ?', [identificacion]);
  
        return {
          finca: finca.nombre_finca,
          usuario: `${usuario[0].nombre} ${usuario[0].apellido}`,
          totalPrecio,
          totalValorInversion
        };
      }));
  
      res.json(resultados);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al sumar las producciones' });
    }
  };
  

export const registrarProduccion = async (req, res) => {
    try {
        // Validación de los resultados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cantidad_produccion, precio, fk_id_programacion } = req.body;

        // Obtener el adminId del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la programación existe y pertenece al administrador actual
        const [programacionExist] = await pool.query(
            'SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?',
            [fk_id_programacion, adminId]
        );

        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Esta programación no existe o no está autorizada para este administrador. Registre primero la programación.'
            });
        }

        // Calcular valor_inversion basado en los recursos asociados a la programación
        const [recursos] = await pool.query(`
            SELECT SUM(tr.cantidad_medida * c.precio) AS total_valor_inversion
            FROM actividad_tipo_recursos AS atr
            JOIN tipo_recursos AS tr ON atr.fk_id_tipo_recursos = tr.id_tipo_recursos
            JOIN costos AS c ON tr.id_tipo_recursos = c.fk_id_tipo_recursos
            WHERE atr.fk_id_actividad = ?
        `, [fk_id_programacion]);

        const valor_inversion = recursos[0].total_valor_inversion || 0;

        // Establecer estado como 'activo' por defecto
        const estado = 'activo';

        // Realizar la inserción en la tabla produccion
        const [Registrar] = await pool.query(
            'INSERT INTO produccion (cantidad_produccion, precio, fk_id_programacion, valor_inversion, estado, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
            [cantidad_produccion, precio, fk_id_programacion, valor_inversion, estado, adminId]
        );

        if (Registrar.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se registró correctamente la producción.',
                result: Registrar
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: 'No se ha podido registrar la producción.'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor'
        });
    }
};


export const actualizarProduccion = async (req, res) => {
    try {
        // Validación de los resultados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cantidad_produccion, precio, fk_id_programacion } = req.body;
        const { id_producccion } = req.params; // Obtener id_producccion de los parámetros de la URL

        // Obtener el adminId del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la producción existe y pertenece al administrador actual
        const [produccionExist] = await pool.query(
            'SELECT * FROM produccion WHERE id_producccion = ? AND admin_id = ?',
            [id_producccion, adminId]
        );

        if (produccionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'La producción especificada no existe o no está autorizada para este administrador.'
            });
        }

        // Verificar si la programación existe y pertenece al administrador actual
        const [programacionExist] = await pool.query(
            'SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?',
            [fk_id_programacion, adminId]
        );

        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Esta programación no existe o no está autorizada para este administrador. Registre primero la programación.'
            });
        }

        // Calcular valor_inversion basado en los recursos asociados a la programación
        const [recursos] = await pool.query(`
            SELECT SUM(tr.cantidad_medida * c.precio) AS total_valor_inversion
            FROM actividad_tipo_recursos AS atr
            JOIN tipo_recursos AS tr ON atr.fk_id_tipo_recursos = tr.id_tipo_recursos
            JOIN costos AS c ON tr.id_tipo_recursos = c.fk_id_tipo_recursos
            WHERE atr.fk_id_actividad = ?
        `, [fk_id_programacion]);

        const valor_inversion = recursos[0].total_valor_inversion || 0;

        // Actualizar la producción en la tabla produccion
        const [actualizar] = await pool.query(
            'UPDATE produccion SET cantidad_produccion = ?, precio = ?, fk_id_programacion = ?, valor_inversion = ? WHERE id_producccion = ? AND admin_id = ?',
            [cantidad_produccion, precio, fk_id_programacion, valor_inversion, id_producccion, adminId]
        );

        if (actualizar.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se actualizó correctamente la producción.',
                result: actualizar
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: 'No se ha podido actualizar la producción.'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor'
        });
    }
};


export const desactivarProduccion = async (req, res) => {
    try {
        const { id_producccion } = req.params;

        await pool.query("START TRANSACTION");

        const [currentResult] = await pool.query(
            "SELECT estado FROM produccion WHERE id_producccion = ?",
            [id_producccion]
        );

        if (currentResult.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({
                status: 404,
                message: "La produccion con el id " + id_producccion  + " no fue encontrada",
            });
        }

        const currentState = currentResult[0].estado;

        const nuevoEstado = currentState === 'activo' ? 'inactivo' : 'activo';

        await pool.query(
            "UPDATE produccion SET estado = ? WHERE id_producccion = ?",
            [nuevoEstado, id_producccion]
        );


        // Confirmar la transacción
        await pool.query("COMMIT");

        res.status(200).json({
            status: 200,
            message: "El estado de la produccion ha sido cambiado a " + nuevoEstado + ".",
            });
    } catch (error) {
        // Si ocurre un error, deshace la transacción
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: 500,
            message: "Error en el sistema: " + error,
        });
    }
};