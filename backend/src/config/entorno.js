// Lee el archivo .env y carga sus valores en process.env
import "dotenv/config";

// Un solo lugar donde se leen las variables de entorno.
export const entorno = {
  puerto: Number(process.env.PORT) || 4000,
  modo: process.env.NODE_ENV || "development",
  urlBaseDatos: process.env.DATABASE_URL,
};