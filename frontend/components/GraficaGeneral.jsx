"use client"; // Recharts mide el tamaño en el navegador, y hay estado y efectos

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { fetchApi } from "@/lib/api";
import { formatearFecha, formatearFechaCorta } from "@/lib/formato";
import styles from "./GraficaGeneral.module.css";
import tablaUi from "./TablaRegistros.module.css"; // cuadros de estado

// Recharts necesita los colores como valores directos (los mismos de globals.css)
const AZUL = "#2563eb";
const COLOR_BORDE = "#e2e8f0";
const COLOR_TEXTO = "#64748b";
const AMARILLO = "#d97706";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const formatear = (valor) => valor.toLocaleString("es-CO");

// "2026-10-25" -> milisegundos (en UTC, para que la zona horaria no mueva el dia).
// El eje horizontal es una linea de tiempo, asi que necesita numeros.
function aMs(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

// Convierte los filtros en el texto que va despues del "?" de la direccion.
// Es la misma logica del resumen de las tarjetas: asi ambos ven el mismo periodo.
// Devuelve null si el rango esta incompleto.
function construirConsulta(filtros) {
  const parametros = new URLSearchParams();
  parametros.set("periodo", filtros.periodo);

  if (filtros.periodo === "rango") {
    if (!filtros.desde || !filtros.hasta) return null;
    parametros.set("desde", filtros.desde);
    parametros.set("hasta", filtros.hasta);
  } else if (filtros.fecha) {
    parametros.set("fecha", filtros.fecha);
  }

  return parametros.toString();
}

// Marcas del eje horizontal, segun cuanto dure el periodo:
//  - hasta 14 dias:  una por dia
//  - hasta 62 dias:  una por semana
//  - mas:            el dia 1 de cada mes (o cada 3 o 6 meses si es muy largo)
function marcasDelEje(desdeIso, hastaIso) {
  const inicio = aMs(desdeIso);
  const fin = aMs(hastaIso);
  const dias = Math.round((fin - inicio) / MS_POR_DIA) + 1;
  const marcas = [];

  if (dias <= 14) {
    for (let t = inicio; t <= fin; t += MS_POR_DIA) marcas.push(t);
  } else if (dias <= 62) {
    for (let t = inicio; t <= fin; t += 7 * MS_POR_DIA) marcas.push(t);
  } else {
    const paso = dias <= 400 ? 1 : dias <= 1100 ? 3 : 6;
    const fecha = new Date(inicio);
    const anio = fecha.getUTCFullYear();
    // Si el periodo no empieza el dia 1, la primera marca es el mes siguiente
    const mesInicial = fecha.getUTCMonth() + (fecha.getUTCDate() === 1 ? 0 : 1);

    for (let k = 0; ; k += paso) {
      const t = Date.UTC(anio, mesInicial + k, 1); // Date.UTC corrige meses mayores de 11
      if (t > fin) break;
      marcas.push(t);
    }
  }

  return marcas;
}

// Globo al pasar el mouse por un punto: fecha, total del dia y cada culto
function GloboDia({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload;

  return (
    <div className={styles.globo}>
      <p className={styles.globoTitulo}>{formatearFecha(punto.fecha)}</p>
      <p className={styles.globoTotal}>{formatear(punto.total)} asistentes</p>
      <ul className={styles.globoLista}>
        {punto.cultos.map((culto) => (
          <li key={culto.id}>
            {culto.tipoCulto}: {formatear(culto.total)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------
// Titulo, datos y grafica de UN periodo (ya con los datos del servidor)
// ------------------------------------------------------------
function ContenidoGrafica({ datos }) {
  const { periodo, puntos, resumen } = datos;

  if (puntos.length === 0) {
    return (
      <div className={tablaUi.vacio}>
        <p className={tablaUi.vacioTitulo}>No hay cultos registrados en este período</p>
        <p>Cuando se registren, aparecerán aquí día por día.</p>
      </div>
    );
  }

  // Cada punto lleva su posicion en la linea de tiempo ("x")
  const datosGrafica = puntos.map((punto) => ({ ...punto, x: aMs(punto.fecha) }));

  const estiloEje = { fill: COLOR_TEXTO, fontSize: 12 };
  const marcas = marcasDelEje(periodo.desde, periodo.hastaEfectivo);
  const periodoLargo = marcas.length > 0 && aMs(periodo.hastaEfectivo) - aMs(periodo.desde) > 62 * MS_POR_DIA;

  // "5 nov" si el periodo es corto; "nov 26" si abarca muchos meses
  const formatoMarca = (ms) =>
    new Date(ms).toLocaleDateString(
      "es-CO",
      periodoLargo
        ? { month: "short", year: "2-digit", timeZone: "UTC" }
        : { day: "numeric", month: "short", timeZone: "UTC" }
    );

  const mayor = resumen.mayorDia;

  return (
    <>
      <ul className={styles.datos}>
        <li className={styles.dato}>
          <span className={styles.datoEtiqueta}>Días con culto</span>
          <span className={styles.datoValor}>{formatear(resumen.diasConCulto)}</span>
        </li>
        <li className={styles.dato}>
          <span className={styles.datoEtiqueta}>Promedio por día con culto</span>
          <span className={styles.datoValor}>{formatear(resumen.promedioPorDia)}</span>
        </li>
        <li className={styles.dato}>
          <span className={styles.datoEtiqueta}>
            Día de mayor asistencia{mayor.length > 1 ? " (empatan)" : ""}
          </span>
          <span className={styles.datoValor}>
            {formatearFechaCorta(mayor[0].fecha)} · {formatear(mayor[0].total)}
          </span>
        </li>
      </ul>

      <div className={styles.area}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosGrafica} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
            {/* Linea de tiempo: numerica, con las marcas elegidas arriba */}
            <XAxis
              dataKey="x"
              type="number"
              scale="time"
              domain={[aMs(periodo.desde), aMs(periodo.hastaEfectivo)]}
              ticks={marcas}
              tickFormatter={formatoMarca}
              tick={estiloEje}
            />
            <YAxis tick={estiloEje} allowDecimals={false} domain={[0, "auto"]} />
            <Tooltip content={<GloboDia />} />
            <ReferenceLine
              y={resumen.promedioPorDia}
              stroke={AMARILLO}
              strokeDasharray="6 4"
              label={{
                value: `Promedio por día: ${formatear(resumen.promedioPorDia)}`,
                position: "insideTopRight",
                fill: AMARILLO,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={AZUL}
              strokeWidth={3}
              dot={puntos.length > 120 ? false : { r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className={styles.nota}>
        Cada punto es un día con culto y suma todos los cultos de ese día (el domingo, mañana y
        tarde). La línea solo une los puntos para ver la tendencia: un tramo recto largo puede
        significar días sin culto o sin registro, y no se cuenta como cero asistentes.
      </p>
    </>
  );
}

// ------------------------------------------------------------
// Seccion completa. Recibe los filtros del periodo desde la pagina
// (los mismos de las tarjetas).
// ------------------------------------------------------------
export default function GraficaGeneral({ filtros }) {
  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: "" });

  const consulta = filtros ? construirConsulta(filtros) : null;
  const cargando = consulta !== null && resultado.clave !== consulta;

  useEffect(() => {
    if (consulta === null) return; // sin filtros todavia, o rango incompleto

    // "activo" descarta respuestas viejas si cambias de periodo rapido
    let activo = true;

    fetchApi(`/api/estadisticas/historial?${consulta}`)
      .then(async (respuesta) => {
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
          throw new Error(
            datos?.errores?.[0]?.mensaje ?? datos?.mensaje ?? "No se pudo cargar la gráfica."
          );
        }

        if (activo) setResultado({ clave: consulta, datos, error: "" });
      })
      .catch((error) => {
        if (!activo) return;
        const mensaje =
          error instanceof TypeError
            ? "No se pudo conectar con el servidor. Revisa que esté encendido."
            : error.message;
        setResultado({ clave: consulta, datos: null, error: mensaje });
      });

    return () => {
      activo = false;
    };
  }, [consulta]);

  // Sin filtros todavia, o rango incompleto: las tarjetas ya explican que falta
  if (consulta === null) return null;

  const datos = resultado.datos;
  const hayDatos = !cargando && !resultado.error && datos !== null;

  let cuerpo;

  if (cargando) {
    cuerpo = (
      <div className={tablaUi.vacio} role="status">
        <p>Cargando gráfica...</p>
      </div>
    );
  } else if (resultado.error) {
    cuerpo = (
      <div className={`${tablaUi.vacio} ${tablaUi.errorCarga}`} role="alert">
        <p className={tablaUi.vacioTitulo}>No se pudo cargar la gráfica</p>
        <p>{resultado.error}</p>
      </div>
    );
  } else {
    cuerpo = <ContenidoGrafica datos={datos} />;
  }

  return (
    <section className={styles.seccion} aria-label="Gráfica general de asistencia">
      <article className={styles.panel}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>Asistencia día por día</h2>
          {hayDatos && (
            <p className={styles.periodo}>
              Del {formatearFechaCorta(datos.periodo.desde)} al{" "}
              {formatearFechaCorta(datos.periodo.hastaEfectivo)}
              {datos.periodo.enCurso && " (hasta hoy)"}
            </p>
          )}
        </div>

        {cuerpo}
      </article>
    </section>
  );
}