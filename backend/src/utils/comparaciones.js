// Diferencia porcentual entre dos totales, con un decimal.
// Devuelve null cuando no se puede calcular:
//  - falta alguno de los dos (null = sin datos)
//  - el anterior es 0 (dividir entre cero no tiene sentido)
export function diferenciaPorcentual(actual, anterior) {
  if (actual === null || anterior === null || anterior === 0) return null;
  return Math.round(((actual - anterior) / anterior) * 1000) / 10;
}

// La misma fecha, un anio antes. "2026-11-02" -> "2025-11-02".
// El 29 de febrero pasa al 28, porque el anio anterior no es bisiesto.
export function mismaFechaAnioAnterior(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-");
  const diaAnterior = mes === "02" && dia === "29" ? "28" : dia;
  return `${Number(anio) - 1}-${mes}-${diaAnterior}`;
}