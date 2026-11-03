import test from "node:test";
import assert from "node:assert/strict";
import { diferenciaPorcentual, mismaFechaAnioAnterior } from "../src/utils/comparaciones.js";

test("diferenciaPorcentual: sube, baja y redondea a un decimal", () => {
  assert.equal(diferenciaPorcentual(110, 100), 10);
  assert.equal(diferenciaPorcentual(90, 100), -10);
  assert.equal(diferenciaPorcentual(1, 3), -66.7);
  assert.equal(diferenciaPorcentual(100, 100), 0);
});

test("diferenciaPorcentual: sin datos suficientes devuelve null", () => {
  assert.equal(diferenciaPorcentual(100, null), null);
  assert.equal(diferenciaPorcentual(null, 100), null);
  assert.equal(diferenciaPorcentual(100, 0), null);
});

test("mismaFechaAnioAnterior: conserva el dia y mes", () => {
  assert.equal(mismaFechaAnioAnterior("2026-11-02"), "2025-11-02");
  assert.equal(mismaFechaAnioAnterior("2026-12-31"), "2025-12-31");
});

test("mismaFechaAnioAnterior: el 29 de febrero pasa al 28", () => {
  assert.equal(mismaFechaAnioAnterior("2028-02-29"), "2027-02-28");
});