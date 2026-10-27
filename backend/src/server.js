import app from "./app.js";
import { entorno } from "./config/entorno.js";

// Enciende el servidor y lo deja escuchando peticiones en el puerto elegido
app.listen(entorno.puerto, () => {
  console.log(`API escuchando en http://localhost:${entorno.puerto}`);
});