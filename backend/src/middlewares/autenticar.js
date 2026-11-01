import { NOMBRE_COOKIE, opcionesCookie } from "../config/sesion.js";
import { hashearToken } from "../utils/tokens.js";
import { buscarUsuarioDeSesion } from "../repositories/sesiones.repository.js";

// Comprueba la sesion. "permitirClaveTemporal" decide si deja pasar a una
// cuenta que todavia usa una contrasena temporal.
async function validarSesion(req, res, next, permitirClaveTemporal) {
  const token = req.cookies?.[NOMBRE_COOKIE];

  if (typeof token !== "string" || token === "") {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  const usuario = await buscarUsuarioDeSesion(hashearToken(token));

  if (!usuario) {
    // La cookie ya no sirve (vencio o cerraron la sesion): la quitamos
    res.clearCookie(NOMBRE_COOKIE, opcionesCookie);
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  // Con contrasena temporal solo se puede cambiar la contrasena (o salir)
  if (usuario.debeCambiarClave && !permitirClaveTemporal) {
    return res.status(403).json({
      mensaje: "Debes cambiar tu contraseña temporal antes de continuar.",
      codigo: "CAMBIO_CLAVE_OBLIGATORIO",
    });
  }

  req.usuario = usuario;
  next();
}

// Uso normal: casi todas las rutas
export const autenticar = (req, res, next) => validarSesion(req, res, next, false);

// Solo para: /yo, /cambiar-clave
export const autenticarPermitiendoClaveTemporal = (req, res, next) =>
  validarSesion(req, res, next, true);