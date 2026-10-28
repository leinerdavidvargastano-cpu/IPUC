import { pool } from "../config/baseDatos.js";

// Guarda un culto y devuelve el registro creado.
// $1, $2... son parametros: los valores viajan separados de la orden SQL,
// asi es imposible la inyeccion SQL.
export async function insertarCulto(datos, usuarioId) {
  const resultado = await pool.query(
    `INSERT INTO cultos
       (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes,
        ofrenda_cop, dirigio, predico, lema, tema, observaciones, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id,
               fecha,
               tipo_culto_id    AS "tipoCultoId",
               hermanos, visitas, ninos, adolescentes,
               total_asistentes AS "totalAsistentes",
               ofrenda_cop      AS "ofrendaCop",
               dirigio, predico, lema, tema, observaciones,
               creado_en        AS "creadoEn"`,
    [
      datos.fecha,
      datos.tipoCultoId,
      datos.hermanos,
      datos.visitas,
      datos.ninos,
      datos.adolescentes,
      datos.ofrendaCop,
      datos.dirigio,
      datos.predico,
      datos.lema,
      datos.tema,
      datos.observaciones,
      usuarioId,
    ]
  );

  return resultado.rows[0];
}