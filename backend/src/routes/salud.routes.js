import { Router } from "express";

// Un Router agrupa las rutas de un mismo tema
const router = Router();

// GET /api/salud  (el prefijo "/api/salud" se define en app.js)
// req = la petición que llega; res = la respuesta que enviamos
router.get("/", (req, res) => {
  // res.json responde en formato JSON, el idioma de las APIs
  res.json({
    estado: "ok",
    servicio: "api-asistencia-ipuc",
    fecha: new Date().toISOString(),
  });
});

export default router;