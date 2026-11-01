import { esquemaLogin, esquemaCambiarClave } from "../validators/auth.validator.js";
import {
  buscarUsuarioPorEmail,
  buscarPasswordHashPorId,
  cambiarClavePropia,
} from "../repositories/usuarios.repository.js";
import {
  crearSesion,
  eliminarSesion,
  eliminarSesionesVencidas,
} from "../repositories/sesiones.repository.js";
import { hashearContrasena, verificarContrasena } from "../utils/contrasenas.js";
import { validarContrasenaNueva } from "../utils/politicaContrasenas.js";
import { generarToken, hashearToken } from "../utils/tokens.js";
import { NOMBRE_COOKIE, DURACION_SESION_MS, opcionesCookie } from "../config/sesion.js";

// Un hash "de mentira". Si el correo no existe, igual hacemos el calculo
// de comparacion contra este hash. Asi la respuesta tarda lo mismo exista
// o no la cuenta, y nadie puede descubrir que correos estan registrados
// midiendo tiempos.
const HASH_FALSO = await hashearContrasena("contrasena-falsa-para-igualar-tiempos");

// POST /api/auth/login
export async function iniciarSesion(req, res) {
  const validacion = esquemaLogin.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({ mensaje: "Escribe tu correo y tu contraseña." });
  }

  const { email, contrasena } = validacion.data;

  const usuario = await buscarUsuarioPorEmail(email);
  const correcta = await verificarContrasena(
    contrasena,
    usuario ? usuario.passwordHash : HASH_FALSO
  );

  // Mismo mensaje para "no existe", "clave incorrecta" y "cuenta desactivada":
  // no le damos pistas a quien este probando.
  if (!usuario || !correcta || !usuario.activo) {
    return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
  }

  // Limpieza ocasional de sesiones vencidas
  await eliminarSesionesVencidas();

  // Creamos la sesion: guardamos la huella y entregamos el codigo en la cookie
  const token = generarToken();
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS);
  await crearSesion(usuario.id, hashearToken(token), expiraEn);

  res.cookie(NOMBRE_COOKIE, token, { ...opcionesCookie, maxAge: DURACION_SESION_MS });

  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  });
}

// POST /api/auth/logout
export async function cerrarSesion(req, res) {
  const token = req.cookies?.[NOMBRE_COOKIE];

  if (typeof token === "string" && token !== "") {
    await eliminarSesion(hashearToken(token));
  }

  res.clearCookie(NOMBRE_COOKIE, opcionesCookie);
  res.status(204).end();
}

// GET /api/auth/yo  (devuelve quien tiene la sesion abierta)
export function obtenerYo(req, res) {
  // El guardia ya comprobo la sesion y dejo los datos en req.usuario
  res.json(req.usuario);
}

// POST /api/auth/cambiar-clave
export async function cambiarClave(req, res) {
  const validacion = esquemaCambiarClave.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({ mensaje: "Escribe tu contraseña actual y la nueva." });
  }

  const { contrasenaActual, contrasenaNueva } = validacion.data;

  // 1) La contrasena actual debe ser correcta (aunque la sesion este abierta,
  //    asi nadie que encuentre un computador desatendido puede cambiarla)
  const guardado = await buscarPasswordHashPorId(req.usuario.id);
  const correcta = guardado ? await verificarContrasena(contrasenaActual, guardado) : false;

  if (!correcta) {
    // 400 y no 401: aqui 401 significaria "sesion vencida" para el frontend
    return res.status(400).json({ mensaje: "La contraseña actual no es correcta." });
  }

  // 2) La nueva debe cumplir la politica
  const problema = validarContrasenaNueva(contrasenaNueva, {
    email: req.usuario.email,
    nombre: req.usuario.nombre,
    contrasenaActual,
  });

  if (problema) {
    return res.status(400).json({ mensaje: problema });
  }

  // 3) Guardar la huella nueva y cerrar las demas sesiones
  const nuevoHash = await hashearContrasena(contrasenaNueva);
  await cambiarClavePropia(req.usuario.id, nuevoHash, hashearToken(req.cookies[NOMBRE_COOKIE]));

  res.status(204).end();
}