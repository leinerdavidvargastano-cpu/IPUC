import { NOMBRE_COOKIE, opcionesCookie } from "../config/sesion.js";
import { hashearToken } from "../utils/tokens.js";
import { buscarUsuarioDeSesion } from "../repositories/sesiones.repository.js";

// Deja pasar solo a quien tenga una sesion valida.
// Si pasa, deja sus datos en req.usuario para que los use el resto del codigo.
export async function autenticar(req, res, next) {
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

  req.usuario = usuario;
  next();
}