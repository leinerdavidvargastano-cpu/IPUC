import { pool } from "../config/baseDatos.js";

// Todos los tipos de culto (activos o no), en el orden configurado
export async function listarTiposCulto() {
  const resultado = await pool.query(
    `SELECT id,
            nombre,
            dia_semana AS "diaSemana",
            orden,
            activo
       FROM tipos_culto
      ORDER BY orden`
  );

  return resultado.rows;
}

// Cultos NO eliminados entre dos fechas (ambas incluidas)
export async function listarCultosEntre(desde, hasta) {
  const resultado = await pool.query(
    `SELECT c.id,
            c.fecha,
            c.tipo_culto_id    AS "tipoCultoId",
            t.nombre           AS "tipoCulto",
            c.hermanos, c.visitas, c.ninos, c.adolescentes,
            c.total_asistentes AS total
       FROM cultos c
       JOIN tipos_culto t ON t.id = c.tipo_culto_id
      WHERE c.eliminado_en IS NULL
        AND c.fecha BETWEEN $1 AND $2
      ORDER BY c.fecha, t.orden`,
    [desde, hasta]
  );

  return resultado.rows;
}

// El culto registrado mas reciente (por fecha; si hay dos el mismo dia,
// el que va mas tarde en el orden de los tipos). Devuelve null si no hay ninguno.
export async function obtenerUltimoCulto() {
  const resultado = await pool.query(
    `SELECT c.id,
            c.fecha,
            c.tipo_culto_id    AS "tipoCultoId",
            t.nombre           AS "tipoCulto",
            c.total_asistentes AS total
       FROM cultos c
       JOIN tipos_culto t ON t.id = c.tipo_culto_id
      WHERE c.eliminado_en IS NULL
      ORDER BY c.fecha DESC, t.orden DESC
      LIMIT 1`
  );

  return resultado.rows[0] ?? null;
}