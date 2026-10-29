import { randomBytes, createHash } from "node:crypto";

// Codigo de sesion: 32 bytes aleatorios (imposible de adivinar)
export function generarToken() {
  return randomBytes(32).toString("base64url");
}

// Huella del codigo: es lo unico que se guarda en la base de datos.
// SHA-256 es suficiente aqui porque el codigo ya es aleatorio y muy largo.
export function hashearToken(token) {
  return createHash("sha256").update(token).digest("hex");
}