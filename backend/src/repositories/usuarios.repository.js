import { pool } from "../config/baseDatos.js";

// Busca un usuario por su correo, sin distinguir mayusculas de minusculas.
// Devuelve null si no existe.
export async function buscarUsuarioPorEmail(email) {
  const resultado = await pool.query(
    `SELECT id,
            nombre_completo AS nombre,
            email,
            password_hash   AS "passwordHash",
            rol,
            activo
       FROM usuarios
      WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return resultado.rows[0] ?? null;
}