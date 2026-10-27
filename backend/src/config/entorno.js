// Lee el archivo .env y carga sus valores en process.env
import "dotenv/config";

// Un solo lugar donde se leen las variables de entorno.
// El resto del código importa "entorno" en vez de tocar process.env.
export const entorno = {
  // Todo lo que viene del .env llega como texto, por eso lo convertimos a número.
  // Si no existe PORT, usamos 4000 por defecto.
  puerto: Number(process.env.PORT) || 4000,
  modo: process.env.NODE_ENV || "development",
};