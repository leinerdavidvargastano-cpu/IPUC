import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import { obtenerTiposCulto } from "../controllers/tiposCulto.controller.js";

const router = Router();

// GET /api/tipos-culto  (exige sesion iniciada)
router.get("/", autenticar, obtenerTiposCulto);

export default router;