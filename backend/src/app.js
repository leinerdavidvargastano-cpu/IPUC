import express from "express";
import rutasSalud from "./routes/salud.routes.js";
import rutasTiposCulto from "./routes/tiposCulto.routes.js";
import { rutaNoEncontrada, manejadorErrores } from "./middlewares/manejadorErrores.js";

// Aqui se configura la aplicacion. NO se enciende el servidor todavia.
const app = express();

// Permite leer los datos que el frontend envia en formato JSON
app.use(express.json());

// Rutas de la API
app.use("/api/salud", rutasSalud);
app.use("/api/tipos-culto", rutasTiposCulto);

// IMPORTANTE: el orden importa. Estos dos van SIEMPRE al final:
// primero las rutas que si existen, luego "no encontrada", luego los errores.
app.use("/api", rutaNoEncontrada);
app.use(manejadorErrores);

export default app;