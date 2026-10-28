import { entorno } from "../config/entorno.js";

// PROVISIONAL (Fase 5): simula que hay un usuario con sesion iniciada.
// En la Fase 6 se reemplaza por la autenticacion real, y el resto del
// codigo no cambia porque seguira leyendo "req.usuario.id".
//
// Falla "cerrado": si no estamos en desarrollo, rechaza la peticion.
// Asi este atajo nunca puede quedar activo en produccion.
export function usuarioActual(req, res, next) {
  if (entorno.modo !== "development" || !entorno.usuarioDesarrolloId) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  req.usuario = { id: entorno.usuarioDesarrolloId };
  next(); // continua con la siguiente funcion de la ruta
}