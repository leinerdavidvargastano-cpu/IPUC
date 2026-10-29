import { Router } from "express";
import { usuarioActual } from "../middlewares/usuarioActual.js";
import {
  obtenerCultos,
  obtenerCulto,
  crearCulto,
  editarCulto,
  borrarCulto,
} from "../controllers/cultos.controller.js";

const router = Router();

// Todas las rutas exigen usuario (por ahora el provisional de desarrollo).
// GET    /api/cultos      -> lista con filtros
// GET    /api/cultos/:id  -> un registro
// POST   /api/cultos      -> crea un culto
// PUT    /api/cultos/:id  -> reemplaza los datos de un culto
// DELETE /api/cultos/:id  -> elimina (borrado logico)
router.get("/", usuarioActual, obtenerCultos);
router.get("/:id", usuarioActual, obtenerCulto);
router.post("/", usuarioActual, crearCulto);
router.put("/:id", usuarioActual, editarCulto);
router.delete("/:id", usuarioActual, borrarCulto);

export default router;