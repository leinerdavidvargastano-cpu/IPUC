// ============================================================
// Calculos de estadistica. Son funciones "puras": reciben datos y
// devuelven un resultado, sin tocar la base de datos. Por eso se
// pueden probar solas, con numeros que se verifican a mano.
// ============================================================

// ---------- Calculos basicos ----------

export function sumar(valores) {
  return valores.reduce((suma, valor) => suma + valor, 0);
}

// Promedio redondeado a un decimal. Sin datos devuelve null (no 0):
// "no hay datos" es distinto de "el promedio es cero".
export function promedio(valores) {
  if (valores.length === 0) return null;
  return Math.round((sumar(valores) / valores.length) * 10) / 10;
}

// Moda: el valor que mas se repite.
//  - Si varios valores empatan en la frecuencia maxima, se devuelven todos.
//  - Si ninguno se repite, no hay moda (hayModa: false).
export function moda(valores) {
  if (valores.length === 0) {
    return { hayModa: false, valores: [], frecuencia: 0 };
  }

  // Un Map cuenta cuantas veces aparece cada valor: { 50 => 2, 70 => 1 ... }
  const conteo = new Map();
  for (const valor of valores) {
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  }

  const frecuencia = Math.max(...conteo.values());

  if (frecuencia === 1) {
    return { hayModa: false, valores: [], frecuencia: 1 };
  }

  const modas = [...conteo.entries()]
    .filter(([, veces]) => veces === frecuencia)
    .map(([valor]) => valor)
    .sort((a, b) => a - b);

  return { hayModa: true, valores: modas, frecuencia };
}

// Culto(s) con mayor y menor asistencia. Si hay empate, salen todos.
// "cultos" es una lista de objetos con la propiedad "total".
export function extremos(cultos) {
  if (cultos.length === 0) return { mayor: [], menor: [] };

  const maximo = Math.max(...cultos.map((culto) => culto.total));
  const minimo = Math.min(...cultos.map((culto) => culto.total));

  return {
    mayor: cultos.filter((culto) => culto.total === maximo),
    menor: cultos.filter((culto) => culto.total === minimo),
  };
}

// ---------- Fechas ("AAAA-MM-DD") ----------
// Se calculan en UTC a proposito: asi la zona horaria del computador nunca
// puede mover un dia. Una fecha como "2026-10-25" siempre es ese dia.

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function aFechaUtc(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

export function sumarDias(fechaIso, dias) {
  const fecha = new Date(aFechaUtc(fechaIso).getTime() + dias * MS_POR_DIA);
  return fecha.toISOString().slice(0, 10);
}

// Lunes de la semana que contiene la fecha dada.
// getUTCDay(): 0 = domingo, 1 = lunes ... 6 = sabado.
// (dia + 6) % 7 cuenta los dias desde el lunes: lunes = 0 ... domingo = 6.
export function inicioDeSemana(fechaIso) {
  const dia = aFechaUtc(fechaIso).getUTCDay();
  const diasDesdeLunes = (dia + 6) % 7;
  return sumarDias(fechaIso, -diasDesdeLunes);
}

// Domingo de la semana que contiene la fecha dada.
export function finDeSemana(fechaIso) {
  return sumarDias(inicioDeSemana(fechaIso), 6);
}

// Fecha de hoy en Colombia ("en-CA" da el formato AAAA-MM-DD).
export function hoyEnColombia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}