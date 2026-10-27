import express from "express";
import rutasSalud from "./routes/salud.routes.js";

// Aquí se configura la aplicación. NO se enciende el servidor todavía.
const app = express();

// Middleware: código que se ejecuta con cada petición antes de llegar a las rutas.
// express.json() permite leer los datos que el frontend envía en formato JSON.
app.use(express.json());

// Conectamos las rutas: todo lo de salud.routes.js queda bajo /api/salud
app.use("/api/salud", rutasSalud);

export default app;