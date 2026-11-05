import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { entorno } from "./config/entorno.js";
import rutasSalud from "./routes/salud.routes.js";
import rutasAuth from "./routes/auth.routes.js";
import rutasUsuarios from "./routes/usuarios.routes.js";
import rutasTiposCulto from "./routes/tiposCulto.routes.js";
import rutasCultos from "./routes/cultos.routes.js";
import rutasEstadisticas from "./routes/estadisticas.routes.js";
import { rutaNoEncontrada, manejadorErrores } from "./middlewares/manejadorErrores.js";

const app = express();

// Cabeceras de seguridad. Tambien quita "X-Powered-By: Express",
// que le dice a cualquiera con que esta hecho el servidor.
app.use(helmet());

// Limite general de peticiones por origen. En desarrollo es muy holgado
// para no estorbar las pruebas; en produccion es mas estricto.
const limitadorGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: entorno.modo === "production" ? 600 : 5000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { mensaje: "Demasiadas peticiones. Espera unos minutos e inténtalo de nuevo." },
});
app.use("/api", limitadorGeneral);

// Nada de la API debe guardarse en la cache del navegador ni de intermediarios:
// son datos privados de la congregacion.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Permite leer los datos que el frontend envia en formato JSON.
// El limite de 20 KB sobra para cualquier formulario del sistema.
app.use(express.json({ limit: "20kb" }));

// Permite leer las cookies que llegan en cada peticion (req.cookies)
app.use(cookieParser());

// Rutas de la API
app.use("/api/salud", rutasSalud);
app.use("/api/auth", rutasAuth);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/tipos-culto", rutasTiposCulto);
app.use("/api/cultos", rutasCultos);
app.use("/api/estadisticas", rutasEstadisticas);

// IMPORTANTE: estos dos van SIEMPRE al final
app.use("/api", rutaNoEncontrada);
app.use(manejadorErrores);

export default app;