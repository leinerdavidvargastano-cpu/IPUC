import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import { exigirRol } from "../middlewares/exigirRol.js";
import {
  obtenerUsuarios,
  crearCuenta,
  cambiarEstadoCuenta,
  restablecerClaveCuenta,
} from "../controllers/usuarios.controller.js";

const router = Router();

// TODAS estas rutas exigen sesion iniciada Y rol de administrador
router.use(autenticar, exigirRol("admin"));

// GET   /api/usuarios                         -> lista de cuentas
// POST  /api/usuarios                         -> crea una cuenta (devuelve la clave temporal UNA vez)
// PATCH /api/usuarios/:id/estado              -> activa o desactiva
// POST  /api/usuarios/:id/restablecer-clave   -> nueva clave temporal
router.get("/", obtenerUsuarios);
router.post("/", crearCuenta);
router.patch("/:id/estado", cambiarEstadoCuenta);
router.post("/:id/restablecer-clave", restablecerClaveCuenta);

export default router;