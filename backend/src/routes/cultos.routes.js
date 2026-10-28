import { Router } from "express";
import { usuarioActual } from "../middlewares/usuarioActual.js";
import { crearCulto } from "../controllers/cultos.controller.js";

const router = Router();

// POST /api/cultos
// Se ejecuta primero usuarioActual, y si deja pasar, crearCulto.
router.post("/", usuarioActual, crearCulto);

export default router;