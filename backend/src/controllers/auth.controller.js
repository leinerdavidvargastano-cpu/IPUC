import { esquemaLogin } from "../validators/auth.validator.js";
import { buscarUsuarioPorEmail } from "../repositories/usuarios.repository.js";
import {
  crearSesion,
  eliminarSesion,
  eliminarSesionesVencidas,
} from "../repositories/sesiones.repository.js";
import { hashearContrasena, verificarContrasena } from "../utils/contrasenas.js";
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
  // "autenticar" ya comprobo la sesion y dejo los datos en req.usuario
  res.json(req.usuario);
}