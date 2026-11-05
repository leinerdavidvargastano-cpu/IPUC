"use client"; // Recharts mide el tamaño en el navegador, y hay estado y efectos

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Gauge, Repeat, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import GloboInformacion from "./GloboInformacion";
import { fetchApi } from "@/lib/api";
import { formatearFechaCorta } from "@/lib/formato";
import styles from "./EstadisticasSemanales.module.css"; // mismos estilos de seccion y graficas
import tablaUi from "./TablaRegistros.module.css"; // estilos de tabla y de cuadros de estado

// Recharts necesita los colores como valores directos (los mismos de globals.css)
const AZUL = "#2563eb";
const AZUL_CLARO = "#93c5fd"; // para las semanas parciales
const COLOR_BORDE = "#e2e8f0";
const COLOR_TEXTO = "#64748b";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Los ultimos 6 anios, empezando por el actual
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 6 }, (_, indice) => ANIO_ACTUAL - indice);

const formatear = (valor) => valor.toLocaleString("es-CO");

// "Semana 4 (19 oct 2026 al 25 oct 2026)". Si hay empate, solo los numeros.
function describirSemanas(lista) {
  if (lista.length === 1) {
    const semana = lista[0];
    return `Semana ${semana.numero} (${formatearFechaCorta(semana.desde)} al ${formatearFechaCorta(
      semana.hasta
    )})`;
  }

  return `Semanas ${lista.map((semana) => semana.numero).join(" y ")} (empatan)`;
}

// ------------------------------------------------------------
// Tarjetas, grafica y tabla de UN mes (ya con los datos del servidor)
// ------------------------------------------------------------
function ContenidoMes({ datos }) {
  const { semanas, resumen } = datos;

  // Sin ningun culto: mensaje claro en lugar de graficas vacias
  if (resumen.cultosRegistrados === 0) {
    return (
      <div className={tablaUi.vacio}>
        <p className={tablaUi.vacioTitulo}>No hay cultos registrados en este mes</p>
        <p>Cuando se registren, aparecerán aquí sus estadísticas.</p>
      </div>
    );
  }

  // Una barra por semana. total: null = sin registros (hueco), no cero.
  const datosGrafica = semanas.map((semana) => ({
    etiqueta: semana.parcial ? `Sem. ${semana.numero} (parcial)` : `Sem. ${semana.numero}`,
    nombre: `Semana ${semana.numero}${semana.parcial ? " (parcial)" : ""}`,
    detalle: `${formatearFechaCorta(semana.desde)} al ${formatearFechaCorta(semana.hasta)} · ${
      semana.cultosRegistrados
    } ${semana.cultosRegistrados === 1 ? "culto" : "cultos"}`,
    total: semana.total,
    parcial: semana.parcial,
  }));

  const { moda, semanaMayor, semanaMenor } = resumen;
  const hayCompletas = resumen.semanasCompletasConRegistros > 0;

  // Propiedades compartidas por los ejes
  const estiloEje = { fill: COLOR_TEXTO, fontSize: 12 };

  return (
    <>
      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado del mes"
          valor={formatear(resumen.totalAcumulado)}
          detalle={`En ${resumen.cultosRegistrados} ${
            resumen.cultosRegistrados === 1 ? "culto" : "cultos"
          }`}
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={formatear(resumen.promedioPorCulto)}
          detalle="Total del mes ÷ cultos registrados"
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Moda por culto"
          valor={moda.hayModa ? moda.valores.map((valor) => formatear(valor)).join(" y ") : "Sin moda"}
          detalle={
            moda.hayModa
              ? `Se repite en ${moda.frecuencia} cultos`
              : "Ninguna asistencia se repite"
          }
          Icono={Repeat}
        />
        <TarjetaEstadistica
          titulo="Promedio semanal (total acumulado)"
          valor={hayCompletas ? formatear(resumen.promedioDelTotalSemanal) : "Sin datos"}
          detalle={
            hayCompletas
              ? `Total acumulado por semana, en ${resumen.semanasCompletasConRegistros} ${
                  resumen.semanasCompletasConRegistros === 1
                    ? "semana completa"
                    : "semanas completas"
                }`
              : "Se necesita al menos una semana completa con registros"
          }
          Icono={CalendarDays}
        />
        <TarjetaEstadistica
          titulo="Semana con mayor asistencia"
          valor={hayCompletas ? formatear(semanaMayor[0].total) : "Sin datos"}
          detalle={hayCompletas ? describirSemanas(semanaMayor) : "Solo cuentan semanas completas"}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Semana con menor asistencia"
          valor={hayCompletas ? formatear(semanaMenor[0].total) : "Sin datos"}
          detalle={hayCompletas ? describirSemanas(semanaMenor) : "Solo cuentan semanas completas"}
          Icono={TrendingDown}
        />
      </div>

      <article className={styles.panel}>
        <h3 className={styles.panelTitulo}>Asistencia total por semana</h3>
        <div className={styles.area}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafica} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
              <XAxis
                dataKey="etiqueta"
                tick={estiloEje}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={estiloEje} allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip
                content={<GloboInformacion />}
                cursor={{ fill: "#dbeafe" }}
                filterNull={false}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {/* Cada barra con su color: clara si la semana es parcial */}
                {datosGrafica.map((punto) => (
                  <Cell key={punto.etiqueta} fill={punto.parcial ? AZUL_CLARO : AZUL} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className={styles.nota}>
          Barra clara = semana parcial (no cabe entera en el mes). Cuenta para el total del mes,
          pero no para el promedio ni la comparación entre semanas. Una semana sin barra no tuvo
          registros: no se cuenta como cero asistentes.
        </p>
      </article>

      {/* ---------- Detalle por semana ---------- */}
      <div className={tablaUi.contenedorTabla} style={{ marginTop: 16 }}>
        <table className={tablaUi.tabla} style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col">Semana</th>
              <th scope="col">Fechas</th>
              <th scope="col" className={tablaUi.numero}>Días</th>
              <th scope="col" className={tablaUi.numero}>Cultos</th>
              <th scope="col" className={tablaUi.numero}>Total</th>
            </tr>
          </thead>
          <tbody>
            {semanas.map((semana) => (
              <tr key={semana.numero}>
                <td>
                  Semana {semana.numero}
                  {semana.parcial && " (parcial)"}
                </td>
                <td>
                  {formatearFechaCorta(semana.desde)} al {formatearFechaCorta(semana.hasta)}
                </td>
                <td className={tablaUi.numero}>{semana.dias}</td>
                <td className={tablaUi.numero}>{semana.cultosRegistrados}</td>
                <td className={`${tablaUi.numero} ${tablaUi.total}`}>
                  {semana.total === null ? "Sin registros" : formatear(semana.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Seccion completa: selectores de mes y anio + contenido
// ------------------------------------------------------------
export default function EstadisticasMensuales() {
  // "" = el actual. Asi no dependemos de la fecha del computador al dibujar.
  const [filtros, setFiltros] = useState({ anio: "", mes: "" });

  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: "" });

  // Solo se envian los filtros que se eligieron
  const parametros = new URLSearchParams();
  if (filtros.anio) parametros.set("anio", filtros.anio);
  if (filtros.mes) parametros.set("mes", filtros.mes);
  const consulta = parametros.toString();

  const clave = consulta || "actual";
  const cargando = resultado.clave !== clave;

  useEffect(() => {
    // "activo" descarta respuestas viejas si cambias de mes rapido
    let activo = true;

    fetchApi(`/api/estadisticas/mensual${consulta ? `?${consulta}` : ""}`)
      .then(async (respuesta) => {
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
          throw new Error(
            datos?.errores?.[0]?.mensaje ?? datos?.mensaje ?? "No se pudo cargar el mes."
          );
        }

        if (activo) setResultado({ clave, datos, error: "" });
      })
      .catch((error) => {
        if (!activo) return;
        const mensaje =
          error instanceof TypeError
            ? "No se pudo conectar con el servidor. Revisa que esté encendido."
            : error.message;
        setResultado({ clave, datos: null, error: mensaje });
      });

    return () => {
      activo = false;
    };
  }, [clave, consulta]);

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((anteriores) => ({ ...anteriores, [name]: value }));
  }

  const datos = resultado.datos;
  const hayDatos = !cargando && !resultado.error && datos !== null;

  let cuerpo;

  if (cargando) {
    cuerpo = (
      <div className={tablaUi.vacio} role="status">
        <p>Cargando mes...</p>
      </div>
    );
  } else if (resultado.error) {
    cuerpo = (
      <div className={`${tablaUi.vacio} ${tablaUi.errorCarga}`} role="alert">
        <p className={tablaUi.vacioTitulo}>No se pudo cargar el mes</p>
        <p>{resultado.error}</p>
      </div>
    );
  } else {
    cuerpo = <ContenidoMes datos={datos} />;
  }

  return (
    <section className={styles.seccion} aria-label="Estadísticas mensuales">
      <h2 className={styles.titulo}>Estadísticas mensuales</h2>
      <p className={styles.subtitulo}>
        {hayDatos ? (
          <>
            <strong>
              {MESES[datos.mes - 1]} de {datos.anio}
            </strong>{" "}
            · semanas de lunes a domingo.
          </>
        ) : (
          "Semanas de lunes a domingo."
        )}
      </p>

      <div className={styles.filtros}>
        <label className={styles.etiquetaFiltro}>
          Mes
          <select
            name="mes"
            className={styles.selector}
            value={filtros.mes}
            onChange={cambiarFiltro}
          >
            <option value="">Mes actual</option>
            {MESES.map((nombre, indice) => (
              <option key={nombre} value={indice + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiquetaFiltro}>
          Año
          <select
            name="anio"
            className={styles.selector}
            value={filtros.anio}
            onChange={cambiarFiltro}
          >
            <option value="">Año actual</option>
            {ANIOS.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cuerpo}
    </section>
  );
}