import { pool } from "../config/baseDatos.js";

// Ejecuta varias consultas como UNA sola operacion:
// o se hacen todas (COMMIT) o no se hace ninguna (ROLLBACK).
export async function enTransaccion(trabajo) {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

// Anota una operacion en el historial.
// IMPORTANTE: "antes" y "despues" nunca deben incluir contrasenas ni hashes.
export async function registrarAuditoria(
  cliente,
  { usuarioId, accion, entidad, entidadId, antes, despues }
) {
  await cliente.query(
    `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_antes, datos_despues)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      usuarioId,
      accion,
      entidad,
      entidadId,
      antes ? JSON.stringify(antes) : null,
      despues ? JSON.stringify(despues) : null,
    ]
  );
}