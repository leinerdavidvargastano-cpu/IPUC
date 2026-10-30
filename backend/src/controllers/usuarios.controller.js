import {
  esquemaCrearUsuario,
  esquemaEstadoUsuario,
} from "../validators/usuarios.validator.js";
import { esquemaId } from "../validators/cultos.validator.js";
import {
  listarUsuarios,
  crearUsuario,
  cambiarEstadoUsuario,
  restablecerClaveUsuario,
} from "../repositories/usuarios.repository.js";
import { generarContrasenaTemporal, hashearContrasena } from "../utils/contrasenas.js";

// Lee y valida el :id de la direccion. Si no es valido, responde 400
// y devuelve null (el controlador debe detenerse).
function leerId(req, res) {
  const validacion = esquemaId.safeParse(req.params.id);

  if (!validacion.success) {
    res.status(400).json({ mensaje: "El identificador no es válido." });
    return null;
  }

  return validacion.data;
}

// GET /api/usuarios
export async function obtenerUsuarios(req, res) {
  res.json(await listarUsuarios());
}

// POST /api/usuarios
export async function crearCuenta(req, res) {
  const validacion = esquemaCrearUsuario.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: validacion.error.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensaje: problema.message,
      })),
    });
  }

  // La contrasena temporal la genera el servidor; en la base solo queda su huella
  const contrasenaTemporal = generarContrasenaTemporal();
  const hash = await hashearContrasena(contrasenaTemporal);

  try {
    const usuario = await crearUsuario(validacion.data, hash, req.usuario.id);

    // Esta respuesta lleva la contrasena: que ningun navegador ni proxy la guarde
    res.set("Cache-Control", "no-store");
    return res.status(201).json({ usuario, contrasenaTemporal });
  } catch (error) {
    // 23505 = violacion de unicidad: ese correo ya tiene cuenta
    if (error.code === "23505") {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo." });
    }
    throw error;
  }
}

// PATCH /api/usuarios/:id/estado
export async function cambiarEstadoCuenta(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  const validacion = esquemaEstadoUsuario.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({ mensaje: "Indica si la cuenta debe estar activa o no." });
  }

  // Un administrador no puede desactivarse a si mismo: el sistema
  // nunca debe quedarse sin nadie que lo administre.
  if (id === req.usuario.id && validacion.data.activo === false) {
    return res.status(400).json({ mensaje: "No puedes desactivar tu propia cuenta." });
  }

  const usuario = await cambiarEstadoUsuario(id, validacion.data.activo, req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ mensaje: "La cuenta no existe." });
  }

  res.json(usuario);
}

// POST /api/usuarios/:id/restablecer-clave
export async function restablecerClaveCuenta(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  // Para tu propia contrasena habra una opcion aparte (se construye en el paso 7)
  if (id === req.usuario.id) {
    return res.status(400).json({
      mensaje: "Para cambiar tu propia contraseña usa la opción de cambiar contraseña.",
    });
  }

  const contrasenaTemporal = generarContrasenaTemporal();
  const hash = await hashearContrasena(contrasenaTemporal);

  const usuario = await restablecerClaveUsuario(id, hash, req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ mensaje: "La cuenta no existe." });
  }

  res.set("Cache-Control", "no-store");
  res.json({ usuario, contrasenaTemporal });
}