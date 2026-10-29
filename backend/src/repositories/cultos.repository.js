import { pool } from "../config/baseDatos.js";

// ------------------------------------------------------------
// Consulta base: trae un culto con el nombre de su tipo y de quien
// lo registro. La reutilizan la lista y la lectura de un solo registro.
// ------------------------------------------------------------
const SELECT_CULTO = `
  SELECT c.id,
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
    JOIN usuarios u    ON u.id = c.creado_por`;

// ------------------------------------------------------------
// Ayudantes
// ------------------------------------------------------------

// Ejecuta varias consultas como UNA sola operacion:
// o se hacen todas (COMMIT) o no se hace ninguna (ROLLBACK).
// "trabajo" es la funcion que recibe la conexion y hace las consultas.
async function enTransaccion(trabajo) {
  // pool.connect() separa UNA conexion del grupo para usarla en exclusiva.
  // Es necesario: BEGIN y COMMIT deben ejecutarse en la misma conexion.
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK"); // algo fallo: se deshace todo
    throw error;
  } finally {
    // SIEMPRE devolvemos la conexion al grupo, haya salido bien o mal
    cliente.release();
  }
}

// Anota una operacion en el historial. "antes" y "despues" son las filas
// completas del culto (o null si no aplica) y se guardan como JSON.
async function registrarAuditoria(cliente, { usuarioId, accion, entidadId, antes, despues }) {
  await cliente.query(
    `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_antes, datos_despues)
     VALUES ($1, $2, 'culto', $3, $4, $5)`,
    [
      usuarioId,
      accion,
      entidadId,
      antes ? JSON.stringify(antes) : null,
      despues ? JSON.stringify(despues) : null,
    ]
  );
}

// ------------------------------------------------------------
// Lectura
// ------------------------------------------------------------

// Lista de ordenamientos permitidos. ORDER BY no admite parametros ($1),
// asi que NUNCA se pega texto del usuario aqui: solo se elige entre
// estas opciones fijas.
const ORDENES = {
  "fecha-desc": "c.fecha DESC, t.orden ASC",
  "fecha-asc": "c.fecha ASC, t.orden ASC",
  "total-desc": "c.total_asistentes DESC, c.fecha DESC, t.orden ASC",
  "total-asc": "c.total_asistentes ASC, c.fecha DESC, t.orden ASC",
};

// Devuelve los cultos que cumplen los filtros (todos son opcionales).
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
    `${SELECT_CULTO}
      WHERE ${condiciones.join(" AND ")}
      ORDER BY ${ORDENES[filtros.orden]}
      LIMIT 1000`,
    valores
  );

  return resultado.rows;
}

// Devuelve UN culto, o null si no existe o esta eliminado.
export async function obtenerCultoPorId(id) {
  const resultado = await pool.query(
    `${SELECT_CULTO} WHERE c.id = $1 AND c.eliminado_en IS NULL`,
    [id]
  );

  return resultado.rows[0] ?? null; // "?? null": si no hay fila, devuelve null
}

// ------------------------------------------------------------
// Escritura (todas dejan anotacion en la auditoria)
// ------------------------------------------------------------

// Guarda un culto nuevo y devuelve su id.
// $1, $2... son parametros: los valores viajan separados de la orden SQL,
// asi es imposible la inyeccion SQL.
export async function insertarCulto(datos, usuarioId) {
  return enTransaccion(async (cliente) => {
    const insertado = await cliente.query(
      `INSERT INTO cultos
         (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes,
          ofrenda_cop, dirigio, predico, lema, tema, observaciones, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
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

    const culto = insertado.rows[0];

    await registrarAuditoria(cliente, {
      usuarioId,
      accion: "crear",
      entidadId: culto.id,
      antes: null,
      despues: culto,
    });

    return culto.id;
  });
}

// Reemplaza los datos de un culto. Devuelve true si lo modifico,
// o false si no existe (o ya estaba eliminado).
export async function actualizarCulto(id, datos, usuarioId) {
  return enTransaccion(async (cliente) => {
    // FOR UPDATE bloquea la fila hasta terminar: evita que dos personas
    // la modifiquen al mismo tiempo.
    const antes = await cliente.query(
      `SELECT * FROM cultos WHERE id = $1 AND eliminado_en IS NULL FOR UPDATE`,
      [id]
    );

    if (antes.rowCount === 0) return false;

    const despues = await cliente.query(
      `UPDATE cultos
          SET fecha = $2,
              tipo_culto_id = $3,
              hermanos = $4,
              visitas = $5,
              ninos = $6,
              adolescentes = $7,
              ofrenda_cop = $8,
              dirigio = $9,
              predico = $10,
              lema = $11,
              tema = $12,
              observaciones = $13,
              modificado_por = $14,
              modificado_en = NOW()
        WHERE id = $1
        RETURNING *`,
      [
        id,
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

    // Guardamos como estaba y como quedo
    await registrarAuditoria(cliente, {
      usuarioId,
      accion: "editar",
      entidadId: id,
      antes: antes.rows[0],
      despues: despues.rows[0],
    });

    return true;
  });
}

// Elimina un culto de forma "logica": no se borra la fila, solo se marca.
// Devuelve true si lo elimino, o false si no existia (o ya estaba eliminado).
export async function eliminarCulto(id, usuarioId) {
  return enTransaccion(async (cliente) => {
    const existente = await cliente.query(
      `SELECT * FROM cultos WHERE id = $1 AND eliminado_en IS NULL FOR UPDATE`,
      [id]
    );

    if (existente.rowCount === 0) return false;

    await cliente.query(
      `UPDATE cultos
          SET eliminado_en = NOW(),
              eliminado_por = $2,
              modificado_en = NOW(),
              modificado_por = $2
        WHERE id = $1`,
      [id, usuarioId]
    );

    await registrarAuditoria(cliente, {
      usuarioId,
      accion: "eliminar",
      entidadId: id,
      antes: existente.rows[0],
      despues: null,
    });

    return true;
  });
}