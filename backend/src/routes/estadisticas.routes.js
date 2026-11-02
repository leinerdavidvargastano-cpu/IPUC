import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import { obtenerSemanal } from "../controllers/estadisticas.controller.js";

const router = Router();

// Cualquier persona con sesion iniciada puede ver las estadisticas
router.use(autenticar);

// GET /api/estadisticas/semanal
router.get("/semanal", obtenerSemanal);

export default router;