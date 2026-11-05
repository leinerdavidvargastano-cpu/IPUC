import test from "node:test";
import assert from "node:assert/strict";
import { calcularPeriodos } from "../src/utils/periodos.js";

// Fecha fija para que las pruebas den siempre lo mismo (un martes)
const HOY = "2026-11-03";

test("semana pasada: se compara con la semana anterior completa", () => {
  const p = calcularPeriodos({ periodo: "semana", fecha: "2026-10-21", hoy: HOY });

  assert.deepEqual(p, {
    desde: "2026-10-19",
    hasta: "2026-10-25",
    hastaEfectivo: "2026-10-25",
    enCurso: false,
    anterior: { desde: "2026-10-12", hasta: "2026-10-18" },
  });
});

test("semana en curso: se cuenta hasta hoy y la anterior se corta igual", () => {
  const p = calcularPeriodos({ periodo: "semana", fecha: HOY, hoy: HOY });

  assert.equal(p.desde, "2026-11-02");
  assert.equal(p.hasta, "2026-11-08");
  assert.equal(p.hastaEfectivo, "2026-11-03");
  assert.equal(p.enCurso, true);
  // Lunes y martes de la semana anterior
  assert.deepEqual(p.anterior, { desde: "2026-10-26", hasta: "2026-10-27" });
});

test("mes pasado: se compara con el mes anterior completo", () => {
  const p = calcularPeriodos({ periodo: "mes", fecha: "2026-10-15", hoy: HOY });

  assert.equal(p.desde, "2026-10-01");
  assert.equal(p.hasta, "2026-10-31");
  assert.equal(p.enCurso, false);
  assert.deepEqual(p.anterior, { desde: "2026-09-01", hasta: "2026-09-30" });
});

test("enero se compara con diciembre del anio anterior", () => {
  const p = calcularPeriodos({ periodo: "mes", fecha: "2026-01-20", hoy: HOY });

  assert.deepEqual(p.anterior, { desde: "2025-12-01", hasta: "2025-12-31" });
});

test("anio en curso: del 1 de enero a hoy contra la misma fecha del anio anterior", () => {
  const p = calcularPeriodos({ periodo: "anio", fecha: "2026-06-01", hoy: HOY });

  assert.equal(p.desde, "2026-01-01");
  assert.equal(p.hasta, "2026-12-31");
  assert.equal(p.hastaEfectivo, "2026-11-03");
  assert.equal(p.enCurso, true);
  assert.deepEqual(p.anterior, { desde: "2025-01-01", hasta: "2025-11-03" });
});

test("rango: el periodo anterior dura lo mismo y termina justo antes", () => {
  const p = calcularPeriodos({
    periodo: "rango",
    desde: "2026-10-05",
    hasta: "2026-10-11",
    hoy: HOY,
  });

  assert.equal(p.enCurso, false);
  assert.deepEqual(p.anterior, { desde: "2026-09-28", hasta: "2026-10-04" });
});