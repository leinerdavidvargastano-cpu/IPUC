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


// Lista blanca de ordenamientos. ORDER BY no admite parametros ($1),
// asi que NUNCA se pega texto del usuario aqui: solo se elige entre
// estas opciones fijas.
const ORDENES = {
  "fecha-desc": "c.fecha DESC, t.orden ASC",
  "fecha-asc": "c.fecha ASC, t.orden ASC",
  "total-desc": "c.total_asistentes DESC, c.fecha DESC, t.orden ASC",
  "total-asc": "c.total_asistentes ASC, c.fecha DESC, t.orden ASC",
};

// Devuelve los cultos que cumplen los filtros (todos los filtros son opcionales).
export async function listarCultos(filtros) {
  // Siempre se excluyen los registros eliminados (borrado logico)
  const condiciones = ["c.eliminado_en IS NULL"];
  const valores = [];

  // Agrega una condicion y guarda su valor aparte.
  // El "?" se cambia por $1, $2... segun la posicion del valor.
  function agregar(condicion, valor) {
    valores.push(valor);
    condiciones.push(condicion.replace("?", `$${valores.length}`));
  }

  if (filtros.fecha) agregar("c.fecha = ?", filtros.fecha);
  if (filtros.tipoCultoId) agregar("c.tipo_culto_id = ?", filtros.tipoCultoId);
  if (filtros.mes) agregar("EXTRACT(MONTH FROM c.fecha) = ?", filtros.mes);
  if (filtros.anio) agregar("EXTRACT(YEAR FROM c.fecha) = ?", filtros.anio);

  const resultado = await pool.query(
    `SELECT c.id,
            c.fecha,
            c.tipo_culto_id      AS "tipoCultoId",
            t.nombre             AS "tipoCulto",
            c.hermanos, c.visitas, c.ninos, c.adolescentes,
            c.total_asistentes   AS "totalAsistentes",
            c.ofrenda_cop        AS "ofrendaCop",
            c.dirigio, c.predico, c.lema, c.tema, c.observaciones,
            u.nombre_completo    AS "registradoPor",
            c.creado_en          AS "creadoEn"
       FROM cultos c
       JOIN tipos_culto t ON t.id = c.tipo_culto_id
       JOIN usuarios u    ON u.id = c.creado_por
      WHERE ${condiciones.join(" AND ")}
      ORDER BY ${ORDENES[filtros.orden]}
      LIMIT 1000`,
    valores
  );

  return resultado.rows;
}



// Elimina un culto de forma "logica": no se borra la fila, solo se marca.
// Devuelve true si lo elimino, o false si no existia (o ya estaba eliminado).
//
// Aqui usamos una TRANSACCION porque son tres operaciones que deben
// ocurrir juntas o no ocurrir: leer el registro, marcarlo y anotar la
// auditoria. Si una falla, se deshace todo (ROLLBACK).
export async function eliminarCulto(id, usuarioId) {
  // pool.connect() separa UNA conexion del grupo para usarla en exclusiva.
  // Es necesario: BEGIN y COMMIT deben ejecutarse en la misma conexion.
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Lee el registro vigente. FOR UPDATE lo bloquea hasta terminar, para que
    // dos personas no lo eliminen a la vez.
    const existente = await cliente.query(
      `SELECT * FROM cultos WHERE id = $1 AND eliminado_en IS NULL FOR UPDATE`,
      [id]
    );

    if (existente.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return false;
    }

    await cliente.query(
      `UPDATE cultos
          SET eliminado_en = NOW(),
              eliminado_por = $2,
              modificado_en = NOW(),
              modificado_por = $2
        WHERE id = $1`,
      [id, usuarioId]
    );

    // Historial: guardamos como estaba el registro antes de eliminarlo
    await cliente.query(
      `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_antes)
       VALUES ($1, 'eliminar', 'culto', $2, $3)`,
      [usuarioId, id, JSON.stringify(existente.rows[0])]
    );

    await cliente.query("COMMIT");
    return true;
  } catch (error) {
    await cliente.query("ROLLBACK"); // algo fallo: se deshace todo
    throw error;
  } finally {
    // SIEMPRE devolvemos la conexion al grupo, haya salido bien o mal
    cliente.release();
  }
}