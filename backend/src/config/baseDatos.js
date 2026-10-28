import pg from "pg";
import { entorno } from "./entorno.js";

// "pg" es una libreria antigua (CommonJS), asi que la importamos completa
// y de ahi sacamos la clase Pool.
const { Pool } = pg;

// DATE (tipo 1082): devolver "2026-10-25" tal cual, sin convertirlo a Date.
pg.types.setTypeParser(1082, (valor) => valor);

// BIGINT (tipo 20): pg lo entrega como texto; lo convertimos a numero.
pg.types.setTypeParser(20, (valor) => Number(valor));

// Si falta la direccion de la base de datos, mejor fallar de inmediato
// con un mensaje claro.
if (!entorno.urlBaseDatos) {
  throw new Error("Falta DATABASE_URL en el archivo backend/.env");
}

// Un "pool" es un grupo de conexiones abiertas que se reutilizan.
export const pool = new Pool({
  connectionString: entorno.urlBaseDatos,
});