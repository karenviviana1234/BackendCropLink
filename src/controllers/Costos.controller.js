import { pool } from '../database/conexion.js';
import { validationResult } from 'express-validator';

export const listarCostos = async (req, res) => {
  try {
      // Obtener el admin_id del usuario autenticado
      const adminId = req.usuario;

      let sql = `
          SELECT cos.id_costos, cos.precio, 
                 tr.nombre_recursos, tr.cantidad_medida, tr.unidades_medida, tr.extras, cos.estado
          FROM costos AS cos
          JOIN tipo_recursos AS tr ON cos.fk_id_tipo_recursos = tr.id_tipo_recursos
          WHERE cos.admin_id = ?;
      `;

      const [result] = await pool.query(sql, [adminId]);
      if (result.length > 0) {
          res.status(200).json(result);
      } else {
          res.status(404).json({ 'message': 'No se encontraron costos' });
      }
  } catch (error) {
      res.status(500).json({ 'status': 500, 'message': 'Error en el sistema: ' + error });
  }
};

export const registrarCostos = async (req, res) => {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      
      const { fk_id_tipo_recursos, precio } = req.body;

      // Obtener el admin_id del usuario autenticado
      const adminId = req.usuario;

      // Verificar si el fk_id_tipo_recursos existe en la tabla tipo_recursos
      let checkSql = `SELECT COUNT(*) AS count FROM tipo_recursos WHERE id_tipo_recursos = ?`;
      const [checkResult] = await pool.query(checkSql, [fk_id_tipo_recursos]);
      
      if (checkResult[0].count === 0) {
          return res.status(400).json({ status: 400, message: 'El valor de fk_id_tipo_recursos no existe en la tabla tipo_recursos' });
      }

      // Modificar la consulta de inserción para incluir el admin_id
      let sql =  `INSERT INTO costos (fk_id_tipo_recursos, precio, estado, admin_id) VALUES (?, ?, 'activo', ?)`;

      const [rows] = await pool.query(sql, [fk_id_tipo_recursos, precio, adminId]);
      if (rows.affectedRows > 0) {
          res.status(200).json({'status': 200, 'message': 'Registro exitoso de sus costos'});
      } else {
          res.status(403).json({'status': 403, 'message': 'Fallo el registro de sus costos'});
      }
  } catch(error) {
      res.status(500).json({'status': 500, 'message': 'error en el sistema: ' + error});
  }
};



// CRUD - Actualizar costos
export const actualizar = async (req, res) => {
  try {
    const { id_costos } = req.params;
    const { precio, fk_id_tipo_recursos } = req.body;

    // Verificar si al menos uno de los campos está presente en la solicitud
    if (!precio && !fk_id_tipo_recursos) {
      return res.status(400).json({ message: 'Al menos uno de los campos (precio, fk_id_tipo_recursos) debe estar presente en la solicitud para realizar la actualización.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Obtener el ID del administrador que realiza la solicitud desde el token
    const admin_id = req.usuario;

    // Verificar si el valor de fk_id_tipo_recursos existe en la tabla tipo_recursos
    let checkSql = `SELECT COUNT(*) AS count FROM tipo_recursos WHERE id_tipo_recursos = ?`;
    const [checkResult] = await pool.query(checkSql, [fk_id_tipo_recursos]);

    if (checkResult[0].count === 0) {
      return res.status(400).json({ status: 400, message: 'El valor de fk_id_tipo_recursos no existe en la tabla tipo_recursos' });
    }

    // Verificar si el costo pertenece al administrador actual
    const [costoExist] = await pool.query('SELECT * FROM costos WHERE id_costos = ? AND admin_id = ?', [id_costos, admin_id]);

    if (costoExist.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'El costo no existe o no está autorizado para actualizar',
      });
    }

    // Realizar la actualización en la base de datos
    let sql = `
      UPDATE costos
      SET fk_id_tipo_recursos = ?,
          precio = ?
      WHERE id_costos = ? AND admin_id = ?
    `;

    const [rows] = await pool.query(sql, [fk_id_tipo_recursos, precio, id_costos, admin_id]);

    if (rows.affectedRows > 0) {
      res.status(200).json({ status: 200, message: 'La información ha sido actualizada' });
    } else {
      res.status(404).json({ status: 404, message: 'No se pudo actualizar la información' });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error en el sistema: ' + error });
  }
};


   export const buscar = async (req, res) => {
    try {
        const { id_costos } = req.params;
        
        // Consulta SQL corregida para incluir las tablas relacionadas
        let sql = `SELECT cos.id_costos, cos.precio, 
        tr.nombre_recursos, tr.cantidad_medida, tr.unidades_medida, tr.extras
 FROM costos AS cos
 JOIN tipo_recursos AS tr ON cos.fk_id_tipo_recursos = tr.id_tipo_recursos
 WHERE cos.id_costos = ?`;
        
        const [resultado] = await pool.query(sql, [id_costos]);

        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).json({
                mensaje: "No se encontró un recurso con ese ID"
            });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en el sistema: ' + error });
    }
};

export const desactivarcosto = async (req, res) => {
  try {
    const { id_costos } = req.params;
    
    // Obtener el estado actual del registro
    const [currentResult] = await pool.query(
      "SELECT estado FROM costos WHERE id_costos=?",
      [id_costos]
    );

    if (currentResult.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "El costo con el id " + id_costos + " no fue encontrado",
      });
    }

    const currentState = currentResult[0].estado;

    // Cambiar el estado del registro
    const nuevoEstado = currentState === 'activo' ? 'inactivo' : 'activo';
    
    // Actualizar el estado en la base de datos
    const [result] = await pool.query(
      "UPDATE costos SET estado=? WHERE id_costos=?",
      [nuevoEstado, id_costos]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "El estado del costo ha sido cambiado a " + nuevoEstado + ".",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No se pudo cambiar el estado del lote",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el sistema: " + error,
    });
  }
};
