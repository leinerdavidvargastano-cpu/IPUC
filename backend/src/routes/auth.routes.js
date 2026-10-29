import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "../middlewares/autenticar.js";
import { iniciarSesion, cerrarSesion, obtenerYo } from "../controllers/auth.controller.js";

const router = Router();

// Maximo 10 intentos FALLIDOS cada 15 minutos por direccion.
// Los inicios de sesion correctos no cuentan.
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { mensaje: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
});

router.post("/login", limitadorLogin, iniciarSesion);
router.post("/logout", cerrarSesion);
router.get("/yo", autenticar, obtenerYo);

export default router;