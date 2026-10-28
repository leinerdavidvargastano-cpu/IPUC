import { Router } from "express";
import { obtenerTiposCulto } from "../controllers/tiposCulto.controller.js";

const router = Router();

// GET /api/tipos-culto  (el prefijo se define en app.js)
router.get("/", obtenerTiposCulto);

export default router;