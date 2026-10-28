import { pool } from "../config/baseDatos.js";

// Devuelve los tipos de culto activos, en el orden configurado.
export async function listarTiposCultoActivos() {
  const resultado = await pool.query(
    `SELECT id,
            nombre,
            dia_semana AS "diaSemana",
            orden
       FROM tipos_culto
      WHERE activo = TRUE
      ORDER BY orden`
  );

  // "rows" es la lista de filas que respondio PostgreSQL
  return resultado.rows;
}