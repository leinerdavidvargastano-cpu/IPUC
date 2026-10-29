// Crea la PRIMERA cuenta de administrador.
// Uso (desde la carpeta backend):  npm run crear-admin
import readline from "node:readline/promises";
import { pool } from "../src/config/baseDatos.js";
import { hashearContrasena } from "../src/utils/contrasenas.js";

// Correo del usuario provisional de desarrollo: no cuenta como administrador real
const EMAIL_USUARIO_DESARROLLO = "desarrollo@local.invalid";
const LARGO_MINIMO_CLAVE = 10;

// Pide un texto SIN mostrar lo que se escribe (para contrasenas).
function preguntarOculto(pregunta) {
  return new Promise((resolver) => {
    process.stdout.write(pregunta);
    let texto = "";

    // Modo "raw": recibimos cada tecla por separado y nada se muestra en pantalla
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    function alRecibir(entrada) {
      for (const caracter of entrada) {
        if (caracter === "\r" || caracter === "\n") {
          // Enter: terminamos
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", alRecibir);
          process.stdout.write("\n");
          resolver(texto);
          return;
        }
        if (caracter === "\u0003") {
          // Ctrl + C: salir
          process.stdout.write("\n");
          process.exit(1);
        }
        if (caracter === "\u007f" || caracter === "\b") {
          texto = texto.slice(0, -1); // borrar la ultima letra
        } else {
          texto += caracter;
        }
      }
    }

    process.stdin.on("data", alRecibir);
  });
}

async function principal() {
  if (!process.stdin.isTTY) {
    console.error("Ejecuta este script en una terminal normal: npm run crear-admin");
    process.exitCode = 1;
    return;
  }

  // Solo se permite crear el PRIMER administrador
  const existentes = await pool.query(
    `SELECT COUNT(*)::int AS cantidad
       FROM usuarios
      WHERE rol = 'admin' AND activo = TRUE AND LOWER(email) <> $1`,
    [EMAIL_USUARIO_DESARROLLO]
  );

  if (existentes.rows[0].cantidad > 0) {
    console.log("Ya existe una cuenta de administrador.");
    console.log("Este script solo sirve para crear la primera. Las demás cuentas se crean desde el sistema.");
    return;
  }

  // Nombre y correo (se ven mientras se escriben)
  const entrada = readline.createInterface({ input: process.stdin, output: process.stdout });
  const nombre = (await entrada.question("Nombre completo: ")).trim();
  const email = (await entrada.question("Correo electrónico: ")).trim().toLowerCase();
  entrada.close();

  if (nombre.length < 3) {
    console.error("El nombre es demasiado corto.");
    process.exitCode = 1;
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("El correo electrónico no es válido.");
    process.exitCode = 1;
    return;
  }

  // Contrasena (no se muestra mientras se escribe)
  const clave = await preguntarOculto(`Contraseña (mínimo ${LARGO_MINIMO_CLAVE} caracteres): `);
  const repetida = await preguntarOculto("Repite la contraseña: ");

  if (clave.length < LARGO_MINIMO_CLAVE) {
    console.error(`La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`);
    process.exitCode = 1;
    return;
  }

  if (clave !== repetida) {
    console.error("Las contraseñas no coinciden.");
    process.exitCode = 1;
    return;
  }

  if (clave.toLowerCase() === email) {
    console.error("La contraseña no puede ser igual al correo.");
    process.exitCode = 1;
    return;
  }

  const hash = await hashearContrasena(clave);

  try {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre_completo, email, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id`,
      [nombre, email, hash]
    );

    console.log(`Administrador creado correctamente (id ${resultado.rows[0].id}).`);
  } catch (error) {
    // 23505 = el correo ya existe
    if (error.code === "23505") {
      console.error("Ya existe una cuenta con ese correo.");
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

principal()
  .catch((error) => {
    console.error("No se pudo crear el administrador:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end()); // cierra la conexion para que el script termine