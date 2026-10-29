import { pool } from "../config/baseDatos.js";

// Guarda una sesion nueva (con la huella del codigo, no el codigo)
export async function crearSesion(usuarioId, tokenHash, expiraEn) {
  await pool.query(
    `INSERT INTO sesiones (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, $3)`,
    [usuarioId, tokenHash, expiraEn]
  );
}

// Devuelve al usuario dueno de una sesion, SOLO si la sesion no ha vencido
// y la cuenta sigue activa. Si no, devuelve null.
export async function buscarUsuarioDeSesion(tokenHash) {
  const resultado = await pool.query(
    `SELECT u.id, u.nombre_completo AS nombre, u.email, u.rol
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token_hash = $1
        AND s.expira_en > NOW()
        AND u.activo = TRUE`,
    [tokenHash]
  );

  return resultado.rows[0] ?? null;
}

// Cierra una sesion
export async function eliminarSesion(tokenHash) {
  await pool.query(`DELETE FROM sesiones WHERE token_hash = $1`, [tokenHash]);
}

// Limpieza: borra las sesiones que ya vencieron
export async function eliminarSesionesVencidas() {
  await pool.query(`DELETE FROM sesiones WHERE expira_en <= NOW()`);
}