// Reglas para la contrasena que elige cada persona.
// Priorizamos el LARGO sobre la complejidad: una frase facil de recordar
// protege mas que una clave corta con simbolos raros.
export const LARGO_MINIMO = 8;
export const LARGO_MAXIMO = 200;

// Contrasenas que cualquiera probaria primero (sin tildes ni espacios)
const MUY_COMUNES = new Set([
  "12345678", "123456789", "1234567890", "11111111", "00000000", "87654321",
  "12341234", "password", "password1", "qwertyui", "qwerty123", "abcd1234",
  "iloveyou", "contrasena", "contrasena1", "iglesia", "iglesia1", "iglesia123",
  "ipuc2026", "ipuc1234", "dios1234", "jesus123", "admin123", "administrador",
  "bienvenido", "colombia", "colombia1", "asistencia",
]);

// Pasa a minusculas, quita tildes y espacios para comparar de forma justa:
// "Contraseña" y "contrasena" cuentan como la misma.
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

// Revisa una contrasena nueva. Devuelve un mensaje con el problema,
// o null si esta bien.
export function validarContrasenaNueva(clave, { email, nombre, contrasenaActual }) {
  if (clave.length < LARGO_MINIMO) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`;
  }

  if (clave.length > LARGO_MAXIMO) {
    return "La contraseña es demasiado larga.";
  }

  if (clave === contrasenaActual) {
    return "La contraseña nueva debe ser distinta de la actual.";
  }

  const limpia = normalizar(clave);

  if (MUY_COMUNES.has(limpia)) {
    return "Esa contraseña es demasiado común. Elige otra.";
  }

  // Un solo caracter repetido: "aaaaaaaa"
  if (/^(.)\1+$/.test(limpia)) {
    return "La contraseña no puede ser un solo carácter repetido.";
  }

  // No debe contener la parte del correo antes de la arroba
  const parteDelCorreo = normalizar(email.split("@")[0]);
  if (parteDelCorreo.length >= 4 && limpia.includes(parteDelCorreo)) {
    return "La contraseña no debe contener tu correo.";
  }

  if (limpia === normalizar(nombre)) {
    return "La contraseña no puede ser tu nombre.";
  }

  return null;
}