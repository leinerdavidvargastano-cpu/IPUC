"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Gauge, CalendarDays, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import GloboInformacion from "./GloboInformacion";
import { asistenciaAnualDemo, anioAnteriorDemo } from "@/lib/datosDemo";
import styles from "./EstadisticasSemanales.module.css"; // mismos estilos

const ANIOS = [2024, 2025, 2026];

export default function EstadisticasAnuales() {
  const [anio, setAnio] = useState(2026);
  const datos = asistenciaAnualDemo;

  // Solo los meses que SÍ tienen registros. Un mes con total null
  // no cuenta como cero: simplemente no entra en los cálculos.
  const conRegistros = datos.filter((mes) => mes.total !== null);
  const sinRegistros = datos.filter((mes) => mes.total === null);

  const total = conRegistros.reduce((suma, mes) => suma + mes.total, 0);
  const cultos = conRegistros.reduce((suma, mes) => suma + mes.cultos, 0);

  const promedioPorCulto = Math.round(total / cultos);
  // Promedio mensual del total acumulado (se divide entre los meses CON registros)
  const promedioMensual = Math.round(total / conRegistros.length);

  const mayor = conRegistros.reduce((a, b) => (b.total > a.total ? b : a));
  const menor = conRegistros.reduce((a, b) => (b.total < a.total ? b : a));

  // Variación porcentual frente al año anterior:
  // (actual - anterior) / anterior * 100, redondeada a 1 decimal
  const variacion =
    Math.round(((total - anioAnteriorDemo.total) / anioAnteriorDemo.total) * 1000) / 10;
  const textoVariacion = `${variacion >= 0 ? "+" : ""}${variacion.toLocaleString("es-CO")} %`;

  const estiloEje = { fill: "#64748b", fontSize: 12 };

  return (
    <section className={styles.seccion} aria-label="Estadísticas anuales">
      <h2 className={styles.titulo}>Estadísticas anuales</h2>
      <p className={styles.subtitulo}>Año {anio} · datos de demostración.</p>

      <div className={styles.filtros}>
        <label className={styles.etiquetaFiltro}>
          Año
          <select
            className={styles.selector}
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
          >
            {ANIOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado anual"
          valor={total.toLocaleString("es-CO")}
          detalle={`En ${cultos} cultos registrados`}
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={promedioPorCulto}
          detalle="Total del año ÷ número de cultos"
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Promedio mensual"
          valor={promedioMensual.toLocaleString("es-CO")}
          detalle={`Total acumulado por mes, en ${conRegistros.length} meses con datos`}
          Icono={CalendarDays}
        />
        <TarjetaEstadistica
          titulo="Mes con mayor asistencia"
          valor={mayor.nombre}
          detalle={`${mayor.total.toLocaleString("es-CO")} asistentes en total`}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Mes con menor asistencia"
          valor={menor.nombre}
          detalle={`${menor.total.toLocaleString("es-CO")} asistentes en total`}
          Icono={TrendingDown}
        />
        <TarjetaEstadistica
          titulo="Comparación con el año anterior"
          valor={textoVariacion}
          detalle="Frente a los mismos meses del año anterior"
          Icono={ArrowLeftRight}
          tendencia={variacion >= 0 ? "positiva" : "negativa"}
        />
      </div>

      <article className={styles.panel}>
        <h3 className={styles.panelTitulo}>Asistencia total por mes</h3>
        <div className={styles.area}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="etiqueta" tick={estiloEje} />
              <YAxis tick={estiloEje} allowDecimals={false} />
              <Tooltip content={<GloboInformacion />} cursor={{ fill: "#dbeafe" }} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aviso explícito: sin registros NO es lo mismo que cero asistentes */}
        {sinRegistros.length > 0 && (
          <p className={styles.nota}>
            Sin registros: {sinRegistros.map((m) => m.nombre).join(", ")}. No se
            cuentan como cero asistentes.
          </p>
        )}
      </article>
    </section>
  );
}