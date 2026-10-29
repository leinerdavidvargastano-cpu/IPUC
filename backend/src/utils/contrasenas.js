import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// scrypt trabaja con "callbacks"; promisify lo convierte para usar await
const scryptAsync = promisify(scrypt);

// Parametros de costo (recomendados por OWASP para scrypt).
// N = cuanta memoria y tiempo cuesta cada calculo (debe ser potencia de 2).
// Cada hash usa unos 128 MB de memoria durante una fraccion de segundo.
const N = 2 ** 17;
const R = 8;
const P = 1;
const LARGO_HASH = 64; // bytes
const MEMORIA_MAXIMA = 256 * 1024 * 1024; // limite de seguridad para Node

// Convierte una contrasena en texto seguro para guardar en la base de datos.
// Formato: scrypt$N$r$p$sal$hash
// Guardar los parametros dentro del texto permite subir el costo en el
// futuro sin invalidar las contrasenas que ya existen.
export async function hashearContrasena(contrasena) {
  // La sal es un valor aleatorio distinto para cada contrasena
  const sal = randomBytes(16);

  const hash = await scryptAsync(contrasena, sal, LARGO_HASH, {
    N,
    r: R,
    p: P,
    maxmem: MEMORIA_MAXIMA,
  });

  return ["scrypt", N, R, P, sal.toString("base64"), hash.toString("base64")].join("$");
}

// Comprueba si una contrasena coincide con el hash guardado.
// Devuelve true o false; nunca lanza error por un hash mal formado.
export async function verificarContrasena(contrasena, guardado) {
  try {
    const partes = String(guardado).split("$");

    // Un hash valido tiene exactamente 6 partes. Asi, el usuario provisional
    // de desarrollo (cuyo "hash" es solo un texto) jamas puede iniciar sesion.
    if (partes.length !== 6 || partes[0] !== "scrypt") return false;

    const [, n, r, p, salBase64, hashBase64] = partes;
    const sal = Buffer.from(salBase64, "base64");
    const esperado = Buffer.from(hashBase64, "base64");

    const calculado = await scryptAsync(contrasena, sal, esperado.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MEMORIA_MAXIMA,
    });

    // timingSafeEqual compara siempre en el mismo tiempo, sin importar
    // en que posicion difieran. Evita deducir la clave midiendo tiempos.
    return timingSafeEqual(calculado, esperado);
  } catch {
    return false;
  }
}