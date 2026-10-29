import { Router } from "express";
import { usuarioActual } from "../middlewares/usuarioActual.js";
import { crearCulto, obtenerCultos, borrarCulto } from "../controllers/cultos.controller.js";

const router = Router();

// Todas las rutas exigen usuario (por ahora el provisional de desarrollo).
// GET    /api/cultos      -> lista con filtros
// POST   /api/cultos      -> crea un culto
// DELETE /api/cultos/:id  -> elimina (borrado logico)
router.get("/", usuarioActual, obtenerCultos);
router.post("/", usuarioActual, crearCulto);
router.delete("/:id", usuarioActual, borrarCulto);

export default router;