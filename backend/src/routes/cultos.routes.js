import { Router } from "express";
import { usuarioActual } from "../middlewares/usuarioActual.js";
import { crearCulto, obtenerCultos } from "../controllers/cultos.controller.js";

const router = Router();

// Ambas rutas exigen usuario (por ahora el provisional de desarrollo).
// GET  /api/cultos  -> lista con filtros
// POST /api/cultos  -> crea un culto
router.get("/", usuarioActual, obtenerCultos);
router.post("/", usuarioActual, crearCulto);

export default router;