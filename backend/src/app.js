import express from "express";
import rutasSalud from "./routes/salud.routes.js";
import rutasTiposCulto from "./routes/tiposCulto.routes.js";
import rutasCultos from "./routes/cultos.routes.js";
import { rutaNoEncontrada, manejadorErrores } from "./middlewares/manejadorErrores.js";

const app = express();

// Permite leer los datos que el frontend envia en formato JSON
app.use(express.json());

// Rutas de la API
app.use("/api/salud", rutasSalud);
app.use("/api/tipos-culto", rutasTiposCulto);
app.use("/api/cultos", rutasCultos);

// IMPORTANTE: estos dos van SIEMPRE al final
app.use("/api", rutaNoEncontrada);
app.use(manejadorErrores);

export default app;