import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import { exigirRol } from "../middlewares/exigirRol.js";
import {
  obtenerCultos,
  obtenerCulto,
  crearCulto,
  editarCulto,
  borrarCulto,
} from "../controllers/cultos.controller.js";

const router = Router();

// TODAS las rutas de este archivo exigen una sesion iniciada.
// router.use(...) lo aplica a todo lo que se declare debajo.
router.use(autenticar);

// GET    /api/cultos      -> lista con filtros
// GET    /api/cultos/:id  -> un registro
// POST   /api/cultos      -> crea un culto
// PUT    /api/cultos/:id  -> reemplaza los datos de un culto
// DELETE /api/cultos/:id  -> elimina (borrado logico), SOLO administradores
router.get("/", obtenerCultos);
router.get("/:id", obtenerCulto);
router.post("/", crearCulto);
router.put("/:id", editarCulto);
router.delete("/:id", exigirRol("admin"), borrarCulto);

export default router;