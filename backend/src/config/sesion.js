import { entorno } from "./entorno.js";

// Nombre de la cookie que guarda el codigo de sesion
export const NOMBRE_COOKIE = "sesion";

// La sesion dura 12 horas desde que se inicia
export const DURACION_SESION_MS = 12 * 60 * 60 * 1000;

// Opciones de seguridad de la cookie
export const opcionesCookie = {
  httpOnly: true, // JavaScript de la pagina no puede leerla
  sameSite: "lax", // no se envia en peticiones iniciadas por otros sitios
  secure: entorno.modo === "production", // en produccion, solo por HTTPS
  path: "/",
};