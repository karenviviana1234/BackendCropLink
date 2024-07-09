import { query } from "express";
import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

export const listar = async (req, res) => {
  try {
    // Obtener el admin_id del usuario autenticado
    const adminId = req.usuario;

    let sql = `
        SELECT 
            cul.id_cultivo,
            cul.fecha_inicio,
            fin.nombre_finca,
            lo.nombre AS nombre_lote,
            cul.cantidad_sembrada,
            var.nombre_variedad,
            cul.estado
        FROM cultivo AS cul
        JOIN lotes AS lo ON cul.fk_id_lote = lo.id_lote
        JOIN finca AS fin ON lo.fk_id_finca = fin.id_finca
        JOIN variedad AS var ON cul.fk_id_variedad = var.id_variedad
        JOIN usuarios AS u ON fin.admin_id = u.identificacion
        WHERE u.identificacion = ?;
        `;

    const [result] = await pool.query(sql, [adminId]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No se encontraron cultivos" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error en el sistema: " + error });
  }
};

export const registrar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fecha_inicio, cantidad_sembrada, fk_id_lote, fk_id_variedad } =
      req.body;

    // Asignar el valor "activo" directamente al campo estado
    const estado = "activo";

    // Obtener el admin_id del usuario autenticado
    const adminId = req.usuario;

    // Verificar si el lote y la variedad existen
    const [loteResult] = await pool.query(
      "SELECT COUNT(*) AS count FROM lotes WHERE id_lote = ?",
      [fk_id_lote]
    );
    const [variedadResult] = await pool.query(
      "SELECT COUNT(*) AS count FROM variedad WHERE id_variedad = ?",
      [fk_id_variedad]
    );

    if (loteResult[0].count === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "El valor de fk_id_lote no existe en la tabla lotes",
        });
    }

    if (variedadResult[0].count === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "El valor de fk_id_variedad no existe en la tabla variedad",
        });
    }

    const sql = `INSERT INTO cultivo (fecha_inicio, cantidad_sembrada, fk_id_lote, fk_id_variedad, estado, admin_id) VALUES (?, ?, ?, ?, ?, ?)`;

    const [rows] = await pool.query(sql, [
      fecha_inicio,
      cantidad_sembrada,
      fk_id_lote,
      fk_id_variedad,
      estado,
      adminId,
    ]);

    if (rows.affectedRows > 0) {
      res
        .status(200)
        .json({ status: 200, message: "Registro exitoso de su cultivo" });
    } else {
      res
        .status(403)
        .json({ status: 403, message: "Fallo el registro de su cultivo" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error en el sistema: " + error });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id_cultivo } = req.params;
    const { fecha_inicio, cantidad_sembrada, fk_id_lote, fk_id_variedad } =
      req.body;

    if (!fecha_inicio && !cantidad_sembrada && !fk_id_lote && !fk_id_variedad) {
      return res
        .status(400)
        .json({
          message:
            "Al menos uno de los campos (fecha_inicio, cantidad_sembrada, fk_id_lote, fk_id_variedad) debe estar presente en la solicitud para realizar la actualización.",
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si el valor de fk_id_lote existe en la tabla lotes
    const [checkResult1] = await pool.query(
      "SELECT COUNT(*) AS count FROM lotes WHERE id_lote = ?",
      [fk_id_lote]
    );
    const [checkResult2] = await pool.query(
      "SELECT COUNT(*) AS count FROM variedad WHERE id_variedad = ?",
      [fk_id_variedad]
    );

    if (checkResult1[0].count === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "El valor de fk_id_lote no existe en la tabla lotes",
        });
    }

    if (checkResult2[0].count === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "El valor de fk_id_variedad no existe en la tabla variedad",
        });
    }

    // Verificar si el cultivo existe
    const [cultivoExist] = await pool.query(
      "SELECT * FROM cultivo WHERE id_cultivo = ?",
      [id_cultivo]
    );

    if (cultivoExist.length === 0) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "El cultivo no existe. Registre primero un cultivo.",
        });
    }

    // Obtener el admin_id del usuario autenticado
    const adminId = req.usuario;

    let sql = `
            UPDATE cultivo
            SET fecha_inicio = ?,
                cantidad_sembrada = ?,
                fk_id_lote = ?,
                fk_id_variedad = ?,
                admin_id = ?
            WHERE id_cultivo = ?
        `;

    const [rows] = await pool.query(sql, [
      fecha_inicio,
      cantidad_sembrada,
      fk_id_lote,
      fk_id_variedad,
      adminId,
      id_cultivo,
    ]);

    if (rows.affectedRows > 0) {
      res
        .status(200)
        .json({ status: 200, message: "La información ha sido actualizada" });
    } else {
      res
        .status(404)
        .json({ status: 404, message: "No se pudo actualizar la información" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error en el sistema: " + error });
  }
};

export const buscar = async (req, res) => {
  try {
    const { id_cultivo } = req.params;
    const consultar = `
            SELECT cul.id_cultivo,
                   cul.fecha_inicio,
                   cul.cantidad_sembrada, 
                   lo.nombre AS nombre_lote, 
                   fin.nombre_finca,
                   var.nombre_variedad, 
                   cul.estado
            FROM cultivo AS cul
            JOIN lotes AS lo ON cul.fk_id_lote = lo.id_lote
            JOIN finca AS fin ON lo.fk_id_finca = fin.id_finca
            JOIN variedad AS var ON cul.fk_id_variedad = var.id_variedad
            WHERE cul.id_cultivo = ?
        `;
    const [resultado] = await pool.query(consultar, [id_cultivo]);

    if (resultado.length > 0) {
      res.status(200).json(resultado);
    } else {
      res.status(404).json({
        mensaje: "No se encontró un cultivo con ese ID",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error en el sistema: " + error });
  }
};

export const desactivar = async (req, res) => {
  try {
      const { id_cultivo } = req.params;

      // Inicia una transacción
      await pool.query("START TRANSACTION");

      // Consulta el estado actual del lote asociado al cultivo por su ID
      const [lote] = await pool.query("SELECT estado FROM lotes WHERE id_lote = (SELECT fk_id_lote FROM cultivo WHERE id_cultivo = ?)", [id_cultivo]);

      // Verifica si se encontró el lote asociado al cultivo
      if (lote.length === 0) {
          await pool.query("ROLLBACK"); // Si no se encontró el lote asociado, deshace la transacción
          return res.status(404).json({
              status: 404,
              message: 'No se pudo encontrar el lote asociado al cultivo',
          });
      }

      // Verifica si el lote asociado está activo
      if (lote[0].estado !== 'activo') {
          await pool.query("ROLLBACK"); // Si el lote asociado no está activo, deshace la transacción
          return res.status(400).json({
              status: 400,
              message: 'No se puede cambiar el estado del cultivo porque el lote asociado está inactivo',
          });
      }

      // Consulta el estado actual del cultivo por su ID
      const [cultivo] = await pool.query("SELECT * FROM cultivo WHERE id_cultivo = ?", [id_cultivo]);

      // Verifica si se encontró el cultivo
      if (cultivo.length === 0) {
          await pool.query("ROLLBACK"); // Si no se encontró, deshace la transacción
          return res.status(404).json({
              status: 404,
              message: 'Cultivo no encontrado',
          });
      }

      // Determina el nuevo estado
      let nuevoEstado;
      if (cultivo[0].estado === 'activo') {
          nuevoEstado = 'inactivo'; // Si estaba activo, se desactiva
      } else {
          nuevoEstado = 'activo'; // Si estaba inactivo, se activa
      }

      // Actualiza el estado del cultivo
      await pool.query("UPDATE cultivo SET estado = ? WHERE id_cultivo = ?", [nuevoEstado, id_cultivo]);

  
      // Confirma la transacción
      await pool.query("COMMIT");

      res.status(200).json({
          status: 200,
          message: `Estado del cultivo y tablas relacionadas actualizados a ${nuevoEstado}`,
      });
  } catch (error) {
      // Si ocurre un error, deshace la transacción
      await pool.query("ROLLBACK");
      res.status(500).json({
          status: 500,
          message: error.message || 'Error en el sistema',
      });
  }
}

/* 
export const desactivar = async (req, res) => {
    try {
        const { id_cultivo } = req.params;
        const [oldCultivo] = await pool.query("SELECT * FROM cultivo WHERE id_cultivo = ?", [id_cultivo]); 

        if (oldCultivo.length > 0) {
            // Obtener el estado actual del cultivo
            const estadoActual = oldCultivo[0].estado;

            // Determinar el nuevo estado
            let nuevoEstado = '';
            if (estadoActual === 'activo') {
                nuevoEstado = 'inactivo';
            } else {
                nuevoEstado = 'activo';
            }

            // Actualizar el estado del cultivo en la base de datos
            const [result] = await pool.query(
                `UPDATE cultivo SET estado = ? WHERE id_cultivo = ?`, [nuevoEstado, id_cultivo]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({
                    status: 200,
                    message: `Se cambió el estado del cultivo a ${nuevoEstado} con éxito`
                });
            } else {
                res.status(404).json({
                    status: 404,
                    message: 'No se encontró el cultivo para desactivar'
                });
            }
        } else {
            res.status(404).json({
                status: 404,
                message: 'No se encontró el cultivo'
            });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en el sistema: ' + error });
    }
}
 */
