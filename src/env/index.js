import { validationResult } from "express-validator";
import { pool } from "../databases/conexion.js";
import bcrypt from "bcrypt";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/usuarios");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploat = multer({ storage: storage });
export const cargarImagen = uploat.single("imagen_user");

export const getUsers = async (req, res) => {
  try {
    let sql = `SELECT * FROM usuarios`;
    const [rows] = await pool.query(sql);
    if (rows.length > 0) {
      res.status(200).json({ message: "Los usuarios son: ", data: rows });
    } else {
      res.status(404).json({ message: "No hay usuarios registrados por el momento" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor " + error });
  }
};

export const createUser = async (req, res) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pk_cedula_user, nombre_user, email_user, password_user, descripcion_user, telefono_user, rol_user } = req.body;
    const bcryptPassword = bcrypt.hashSync(password_user, 12);
    let imagen_user = req.file ? req.file.originalname : "";

    // Verifica si ya existe un usuario con la misma cédula o correo
    const checkSqlCedula = `SELECT * FROM usuarios WHERE pk_cedula_user = '${pk_cedula_user}'`;
    const [existingCedula] = await pool.query(checkSqlCedula);

    const checkSqlEmail = `SELECT * FROM usuarios WHERE email_user = '${email_user}'`;
    const [existingEmail] = await pool.query(checkSqlEmail);

    if (existingCedula.length > 0) {
      return res.status(400).json({ message: "Ya existe un usuario con esa cédula" });
    }

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" });
    }

    let sql = `INSERT INTO usuarios (pk_cedula_user, nombre_user, email_user, password_user, descripcion_user, telefono_user, rol_user, estado_user`;

    const params = [pk_cedula_user, nombre_user, email_user, bcryptPassword, descripcion_user, telefono_user, rol_user, "activo"]

    if (imagen_user) {
      sql += `, imagen_user`;
      params.push(imagen_user);
    }
    sql += ` ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.query(sql, params);
    if (result.affectedRows > 0) {
      res.status(200).json({ status: 200, message: "Usuario creado exitosamente" });
    } else {
      res.status(404).json({ message: "No se pudo crear el usuario" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { pk_cedula_user, nombre_user, email_user, descripcion_user, telefono_user } = req.body;
    const imagen_user = req.file ? req.file.originalname : "";
    let sql = `
      UPDATE usuarios SET 
      pk_cedula_user = IFNULL(?, pk_cedula_user), 
      nombre_user = IFNULL(?, nombre_user), 
      email_user = IFNULL(?, email_user), 
      descripcion_user = IFNULL(?, descripcion_user), 
      telefono_user = IFNULL(?, telefono_user)
    `;
    const params = [pk_cedula_user, nombre_user, email_user, descripcion_user, telefono_user];

    // Verificar si ya existe un usuario con la misma cédula o correo, excluyendo al usuario actual
    const checkSqlCedula = `SELECT * FROM usuarios WHERE pk_cedula_user = ? AND pk_cedula_user != ?`;
    const [existingCedula] = await pool.query(checkSqlCedula, [pk_cedula_user, id]);

    const checkSqlEmail = `SELECT * FROM usuarios WHERE email_user = ? AND pk_cedula_user != ?`;
    const [existingEmail] = await pool.query(checkSqlEmail, [email_user, id]);

    if (existingCedula.length > 0) {
      return res.status(400).json({ message: "Ya existe un usuario con esa cédula" });
    }

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" });
    }

    // Agregar la actualización de la imagen solo si se proporciona una nueva imagen
    if (imagen_user) {
      sql += `, imagen_user = ?`;
      params.push(imagen_user);
    }
    sql += ` WHERE pk_cedula_user = ?`;
    params.push(id);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario actualizado con éxito" });
    } else {
      res.status(404).json({ message: "Error con el ID al actualizar el usuario" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error del servidor al actualizar el usuario" });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    let sql = `SELECT * FROM usuarios WHERE pk_cedula_user = '${id}'`;
    const [user] = await pool.query(sql);
    if (user.length > 0) {
      res.status(200).json({ message: "Usuario encontrado con exito", data: user });
    } else {
      res.status(404).json({ message: "Error al encontrar el usuario con ese ID" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
};

export const updatePasswordUser = async (req, res) => {
  try {
    const id = req.params.id
    const { oldPassword, newPassword, confirmPassword } = req.body

    const [rows] = await pool.query(`SELECT * FROM usuarios WHERE pk_cedula_user = '${id}'`);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(oldPassword, user.password_user);
    if (!validPassword) {
      return res.status(404).json({ message: "Contraseña incorrecta" });
    }
    if(newPassword !== confirmPassword){
      res.status(404).json({ message: "La nueva contraseña no coincide con la de confirmar contraseña" });
    }
    const bcryptPassword = bcrypt.hashSync(newPassword, 12);

    let sql = `UPDATE usuarios SET password_user = '${bcryptPassword}' WHERE pk_cedula_user = '${id}'`
    const [result] = await pool.query(sql);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Se registro la nueva contraseña con exito" });
    } else {
      res.status(404).json({ message: "Error con el ID del usuario al cambiar la contraseña" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    let sql = `DELETE FROM usuarios WHERE pk_cedula_user = '${id}'`;
    const [result] = await pool.query(sql);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario eliminado con exito" });
    } else {
      res.status(404).json({ message: "Error con el ID al eliminar el usuario" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
};

export const desactivarUsuario = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query(`UPDATE usuarios SET estado_user = 2 WHERE pk_cedula_user = ${id}`);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario desactivado exitosamente" });
    } else {
      res.status(404).json({ message: `No se encontró ningun usuario con el ID` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
};

export const activarUsuario = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query(`UPDATE usuarios SET estado_user = 1 WHERE pk_cedula_user = '${id}'`);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario activado exitosamente" });
    } else {
      res.status(404).json({ message: `No se encontró ningun usuario con el ID` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" + error });
  }
};