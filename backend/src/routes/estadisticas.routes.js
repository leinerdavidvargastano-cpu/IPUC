import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import {
  obtenerSemanal,
  obtenerMensual,
  obtenerAnual,
} from "../controllers/estadisticas.controller.js";

const router = Router();

// Cualquier persona con sesion iniciada puede ver las estadisticas
router.use(autenticar);

// GET /api/estadisticas/semanal
// GET /api/estadisticas/mensual
// GET /api/estadisticas/anual
router.get("/semanal", obtenerSemanal);
router.get("/mensual", obtenerMensual);
router.get("/anual", obtenerAnual);

export default router;