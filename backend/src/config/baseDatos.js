import pg from "pg";
import { entorno } from "./entorno.js";

// "pg" es una librería antigua (CommonJS), así que la importamos completa
// y de ahí sacamos la clase Pool.
const { Pool } = pg;

// Si falta la dirección de la base de datos, mejor fallar de inmediato
// con un mensaje claro que descubrirlo después con un error confuso.
if (!entorno.urlBaseDatos) {
  throw new Error("Falta DATABASE_URL en el archivo backend/.env");
}

// Un "pool" es un grupo de conexiones abiertas que se reutilizan.
// Abrir una conexión nueva en cada petición sería lento; con el pool,
// cada consulta toma una conexión libre y la devuelve al terminar.
export const pool = new Pool({
  connectionString: entorno.urlBaseDatos,
});