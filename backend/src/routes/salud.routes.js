import { Router } from "express";
import { pool } from "../config/baseDatos.js";
import { autenticar } from "../middlewares/autenticar.js";
import { exigirRol } from "../middlewares/exigirRol.js";

// Un Router agrupa las rutas de un mismo tema
const router = Router();

// GET /api/salud  (el prefijo "/api/salud" se define en app.js)
router.get("/", (req, res) => {
  res.json({
    estado: "ok",
    servicio: "api-asistencia-ipuc",
    fecha: new Date().toISOString(),
  });
});

// GET /api/salud/db
// Comprueba que el backend puede hablar con PostgreSQL.
// "async/await" espera a que la base de datos responda sin congelar el servidor.
router.get("/db", autenticar, exigirRol("admin"), async (req, res) => {
  try {
    // SQL: pedimos la hora de la base de datos y su nombre
    const resultado = await pool.query(
      "SELECT NOW() AS ahora, current_database() AS base"
    );

    res.json({
      estado: "ok",
      base: resultado.rows[0].base,
      ahora: resultado.rows[0].ahora,
    });
  } catch (error) {
    // El detalle real del error se queda en la terminal del servidor.
    // Al navegador solo le enviamos un mensaje genérico, para no
    // revelar información interna a quien consulte la API.
    console.error("Error de base de datos:", error.message);
    res.status(503).json({
      estado: "error",
      mensaje: "No hay conexión con la base de datos",
    });
  }
});

export default router;