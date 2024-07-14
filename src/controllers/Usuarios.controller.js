import {pool} from '../database/conexion.js'
import { validationResult } from "express-validator"
// import bcrypt from 'bcrypt';

export const registrarUsuarios = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
  
      const { identificacion, nombre, apellido, correo, password, rol } = req.body;
  
      // Encriptar la contraseña
//    const bcryptPassword = bcrypt.hashSync(password_user, 12);
  
      // Asignar el valor "activo" directamente al campo estado
      const estado = 'activo';
  
      const [rows] = await pool.query(
        `INSERT INTO usuarios (identificacion, nombre, apellido, correo, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [identificacion, nombre, apellido, correo, password, rol, estado]
      );
  
      if (rows.affectedRows > 0) {
        res.status(200).json({
          status:200,
          message: 'Se registró con éxito el usuario ' + nombre
        });
      } else {
        res.status(403).json({
          status: 403,
          message: 'No se registró el usuario'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error del servidor' + error
      });
    }
  }; 

  export const registrarEmpleados = async (req, res) => {
      try {
          // Extraer datos del cuerpo de la solicitud
          const { identificacion, nombre, apellido, correo, password } = req.body;
  
          // Verificar si se proporcionaron todos los datos necesarios
          if (!identificacion || !nombre || !apellido || !correo || !password) {
              return res.status(400).json({ message: 'Todos los campos son obligatorios' });
          }
  
          // Obtener la identificación del administrador que hace la solicitud desde el token, si está disponible
          const admin_id = req.usuario
  
          // Realizar el registro del empleado en la base de datos
          const query = `
              INSERT INTO usuarios (identificacion, nombre, apellido, correo, password, rol, admin_id) 
              VALUES (?, ?, ?, ?, ?, 'empleado', ?)
          `;
  
          const values = [identificacion, nombre, apellido, correo, password, admin_id];
  
          // Ejecutar la consulta SQL
          const [result] = await pool.query(query, values);
  
          // Retornar una respuesta de éxito
          return res.status(200).json({ 
              message: 'Empleado registrado exitosamente',
              nombreRegistrado: nombre,
              idAdministrador: admin_id
          });
      } catch (error) {
          // Manejar errores
          console.error('Error al registrar empleado:', error);
          return res.status(500).json({ message: 'Error del servidor', error: error.message });
      }
  };
  



export const listarUsuarios = async (req, res) => {
    try {
        // Obtener la identificación del administrador que hace la solicitud desde el token
        const adminId = req.usuario; // Aquí asumimos que la identificación del administrador está incluida en decoded.user

        // Consultar la base de datos para obtener la lista de usuarios creados por el administrador actual
        const [result] = await pool.query('SELECT * FROM usuarios WHERE admin_id = ?', [adminId]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'No se encontraron usuarios registrados por este administrador'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Error en el sistema',
            error: error.message
        });
    }
};


export const buscarUsuario = async (req, res) => {
    try {
    const { identificacion } = req.params;

    const [result] = await pool.query("SELECT * FROM usuarios WHERE identificacion=?", [identificacion]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: "No se encontró un asuario con esa identificacion"
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 500, 
            message: 'Error en el sistema: ' + error 
        });
    }
};
export const actualizarUsuario = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identificacion } = req.params;
        const { nombre, apellido, correo, password, rol } = req.body;

        if (!nombre && !apellido && !correo && !password && !rol) {
            return res.status(400).json({ message: 'Al menos uno de los campos (nombre, apellido, correo, password, rol) debe estar presente en la solicitud para realizar la actualización.' });
        }

        const [oldUsuario] = await pool.query("SELECT * FROM usuarios WHERE identificacion = ?", [identificacion]);

        if (oldUsuario.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Usuario no encontrado',
            });
        }

        const updatedUsuario = {
            identificacion: identificacion || oldUsuario[0].identificacion,
            nombre: nombre || oldUsuario[0].nombre,
            apellido: apellido || oldUsuario[0].apellido,
            correo: correo || oldUsuario[0].correo,
            password: password || oldUsuario[0].password,
            rol: rol || oldUsuario[0].rol,
        };

        const [result] = await pool.query(
            `UPDATE usuarios SET identificacion=?, nombre=?, apellido=?, correo=?, password=?, rol=? WHERE identificacion = ?`,
            [updatedUsuario.identificacion, updatedUsuario.nombre, updatedUsuario.apellido, updatedUsuario.correo, updatedUsuario.password, updatedUsuario.rol, identificacion]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: "El usuario ha sido actualizado.",
            });
        } else {
            res.status(404).json({
                status: 404,
                message: "No se pudo actualizar el usuario, inténtalo de nuevo.",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message:"Error en el sistema"+ error.message,
        });
    }
};

export const desactivarUsuario = async (req, res) => {
    try {
        const { identificacion } = req.params;

        // Obtener el estado actual del usuario
        const [currentUser] = await pool.query("SELECT estado FROM usuarios WHERE identificacion=?", [identificacion]);
        if (currentUser.length === 0) {
            return res.status(404).json({
                'status': 404,
                'message': 'No se encontró el usuario con la identificación proporcionada'
            });
        }

        const estadoActual = currentUser[0].estado;
        let nuevoEstado = '';

        // Determinar el nuevo estado
        if (estadoActual === 'activo') {
            nuevoEstado = 'inactivo';
        } else {
            nuevoEstado = 'activo';
        }

        // Actualizar el estado del usuario en la base de datos
        const [result] = await pool.query("UPDATE usuarios SET estado=? WHERE identificacion=?", [nuevoEstado, identificacion]);

        // Actualizar el estado de la tabla de programación según el nuevo estado del usuario
        if (nuevoEstado === 'inactivo') {
            // Desactivar la tabla de programación si el usuario se desactiva
            await pool.query("UPDATE programacion SET estado='inactivo' WHERE fk_identificacion=?", [identificacion]);
        } else {
            // Activar la tabla de programación si el usuario se activa
            await pool.query("UPDATE programacion SET estado='activo' WHERE fk_identificacion=?", [identificacion]);
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({
                'status': 200,
                'message': `Se actualizó con éxito el estado a ${nuevoEstado}`
            });
        } else {
            return res.status(404).json({
                'status': 404,
                'message': 'No se pudo actualizar el estado del usuario'
            });
        }
    } catch (error) {
        res.status(500).json({
            'status': 500,
            'message': 'Error en el sistema: ' + error
        });
    }
};


export const perfil = async (req, res) => {
    try {
      const identificacion = req.usuario;
  
      const [result] = await pool.query(`
        SELECT  
            u.nombre,
            u.identificacion,
            u.apellido,
            u.correo,
            u.rol
        FROM 
            usuarios u
        WHERE 
            u.identificacion = ?;
      `, [identificacion]);
  
      if (result.length > 0) {
        res.status(200).json({
          status: 200,
          data: result[0]  
        });
      } else {
        res.status(404).json({
          status: 404,
          message: 'No se encontró la información del usuario'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error en el sistema: ' + error.message
      });
    }
  };


  export const actualizarPerfil = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { identificacion } = req.params;
      const { nombre, apellido, correo } = req.body;
  
      const [oldUsuario] = await pool.query('SELECT * FROM usuarios WHERE identificacion = ?', [identificacion]);
  
      if (oldUsuario.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'Usuario no encontrado',
        });
      }
  
      const updatedUsuario = {
        nombre: nombre || oldUsuario[0].nombre,
        apellido: apellido || oldUsuario[0].apellido,
        correo: correo || oldUsuario[0].correo,
      };
  
      const [result] = await pool.query(
        `UPDATE usuarios SET nombre=?, apellido=?, correo=? WHERE identificacion = ?`,
        [updatedUsuario.nombre, updatedUsuario.apellido, updatedUsuario.correo, identificacion]
      );
  
      if (result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          message: 'El perfil del usuario ha sido actualizado.',
        });
      } else {
        res.status(500).json({
          status: 500,
          message: 'No se pudo actualizar el perfil del usuario, inténtalo de nuevo.',
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error en el sistema: ' + error.message,
      });
    }
  };
  export const obtenerTotalEmpleados = async (req, res) => {
    try {
      const adminId = req.usuario; 
  
      const [result] = await pool.query(
        'SELECT COUNT(*) as totalEmpleados FROM usuarios WHERE admin_id = ? AND rol = "empleado"',
        [adminId]
      );
  
      if (result.length > 0) {
        res.status(200).json({
          totalEmpleados: result[0].totalEmpleados
        });
      } else {
        res.status(404).json({
          status: 404,
          message: 'No se encontraron empleados registrados por este administrador'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error en el sistema: ' + error.message
      });
    }
  };