// Convierte "2026-10-25" en algo como "dom, 25 oct 2026".
// Separamos el texto a mano y creamos la fecha con new Date(año, mes, día),
// porque new Date("2026-10-25") interpreta la hora en UTC y en Colombia
// podría mostrar el día anterior.
export function formatearFecha(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia); // los meses van de 0 (enero) a 11
  return fecha.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Convierte 150000 en "$ 150.000" (pesos colombianos, sin decimales)
export function formatearPesos(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}