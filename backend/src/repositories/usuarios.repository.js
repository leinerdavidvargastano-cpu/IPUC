import { pool } from "../config/baseDatos.js";
import { enTransaccion, registrarAuditoria } from "./comun.js";

// Columnas que se pueden mostrar. NUNCA incluyen password_hash.
const COLUMNAS_PUBLICAS = `
  id,
  nombre_completo     AS "nombreCompleto",
  email,
  rol,
  activo,
  debe_cambiar_clave  AS "debeCambiarClave",
  creado_en           AS "creadoEn"`;

// Busca un usuario por su correo, sin distinguir mayusculas de minusculas.
// Se usa para iniciar sesion, por eso SI trae el hash. Devuelve null si no existe.
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

// Lista todas las cuentas: primero las activas, por orden alfabetico.
export async function listarUsuarios() {
  const resultado = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS}
       FROM usuarios
      ORDER BY activo DESC, nombre_completo`
  );

  return resultado.rows;
}

// Crea una cuenta nueva con su contrasena temporal (ya convertida en hash).
export async function crearUsuario({ nombreCompleto, email, rol }, passwordHash, adminId) {
  return enTransaccion(async (cliente) => {
    const resultado = await cliente.query(
      `INSERT INTO usuarios (nombre_completo, email, password_hash, rol, debe_cambiar_clave)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING ${COLUMNAS_PUBLICAS}`,
      [nombreCompleto, email, passwordHash, rol]
    );

    const usuario = resultado.rows[0];

    await registrarAuditoria(cliente, {
      usuarioId: adminId,
      accion: "crear",
      entidad: "usuario",
      entidadId: usuario.id,
      antes: null,
      despues: usuario,
    });

    return usuario;
  });
}

// Activa o desactiva una cuenta. Devuelve la cuenta, o null si no existe.
// Al desactivar, se cierran sus sesiones abiertas.
export async function cambiarEstadoUsuario(id, activo, adminId) {
  return enTransaccion(async (cliente) => {
    const antes = await cliente.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (antes.rowCount === 0) return null;

    const despues = await cliente.query(
      `UPDATE usuarios SET activo = $2 WHERE id = $1 RETURNING ${COLUMNAS_PUBLICAS}`,
      [id, activo]
    );

    if (!activo) {
      await cliente.query(`DELETE FROM sesiones WHERE usuario_id = $1`, [id]);
    }

    await registrarAuditoria(cliente, {
      usuarioId: adminId,
      accion: "editar",
      entidad: "usuario",
      entidadId: id,
      antes: antes.rows[0],
      despues: despues.rows[0],
    });

    return despues.rows[0];
  });
}

// Cambia la contrasena de una cuenta por una temporal y cierra sus sesiones.
// Devuelve la cuenta, o null si no existe.
export async function restablecerClaveUsuario(id, passwordHash, adminId) {
  return enTransaccion(async (cliente) => {
    const antes = await cliente.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (antes.rowCount === 0) return null;

    const despues = await cliente.query(
      `UPDATE usuarios
          SET password_hash = $2, debe_cambiar_clave = TRUE
        WHERE id = $1
        RETURNING ${COLUMNAS_PUBLICAS}`,
      [id, passwordHash]
    );

    await cliente.query(`DELETE FROM sesiones WHERE usuario_id = $1`, [id]);

    // En la auditoria queda CONSTANCIA del restablecimiento, no la contrasena
    await registrarAuditoria(cliente, {
      usuarioId: adminId,
      accion: "editar",
      entidad: "usuario",
      entidadId: id,
      antes: antes.rows[0],
      despues: { ...despues.rows[0], claveRestablecida: true },
    });

    return despues.rows[0];
  });
}