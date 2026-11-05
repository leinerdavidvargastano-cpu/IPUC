"use client"; // usa estado, efectos y eventos del navegador

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Users,
  Gauge,
  Trophy,
  CalendarDays,
  TrendingUp,
  UserPlus,
  Baby,
} from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import { fetchApi } from "@/lib/api";
import { formatearFechaCorta } from "@/lib/formato";
import filtrosUi from "./TablaRegistros.module.css"; // reutilizamos los estilos de filtros
import styles from "./ResumenInicio.module.css";

const PERIODOS = [
  { valor: "semana", texto: "Semana" },
  { valor: "mes", texto: "Mes" },
  { valor: "anio", texto: "Año" },
  { valor: "rango", texto: "Rango de fechas" },
];

const FILTROS_INICIALES = { periodo: "mes", fecha: "", desde: "", hasta: "" };

// Convierte los filtros en el texto que va despues del "?" de la direccion.
// Devuelve null si el rango esta incompleto (todavia no se puede pedir nada).
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

// 1234.5 -> "1.234,5"
const formatear = (valor) => valor.toLocaleString("es-CO");

// Arma la lista de tarjetas a partir de la respuesta del servidor.
// Un valor null significa "sin datos": se muestra asi, nunca como cero.
function construirTarjetas(datos) {
  const { ultimoCulto, resumen, tipoMayorAsistencia, comparacion } = datos;

  // ----- Comparacion con el periodo anterior -----
  const hayPorcentaje = comparacion.porcentaje !== null;

  let detalleComparacion;
  if (comparacion.totalAnterior === null) {
    detalleComparacion = "El período anterior no tiene registros";
  } else if (comparacion.totalActual === null) {
    detalleComparacion = `Este período no tiene registros (antes: ${formatear(comparacion.totalAnterior)})`;
  } else {
    detalleComparacion = `Antes: ${formatear(comparacion.totalAnterior)} asistentes en ${comparacion.cultosAnterior} ${
      comparacion.cultosAnterior === 1 ? "culto" : "cultos"
    }`;
  }

  // ----- Tipo de culto con mayor asistencia (si empatan, salen todos) -----
  const hayTipos = tipoMayorAsistencia.length > 0;
  const primerTipo = tipoMayorAsistencia[0];

  // ----- Niños y adolescentes -----
  const ninosYAdolescentes = resumen.ninos === null ? null : resumen.ninos + resumen.adolescentes;

  return [
    {
      titulo: "Último culto registrado",
      valor: ultimoCulto ? formatear(ultimoCulto.total) : "Sin registros",
      detalle: ultimoCulto
        ? `${ultimoCulto.tipoCulto} · ${formatearFechaCorta(ultimoCulto.fecha)}`
        : "Aún no se ha registrado ningún culto",
      Icono: CalendarCheck,
    },
    {
      titulo: "Total de asistentes",
      valor: resumen.totalAsistentes === null ? "Sin registros" : formatear(resumen.totalAsistentes),
      detalle: "Suma de todos los cultos del período",
      Icono: Users,
    },
    {
      titulo: "Promedio de asistencia",
      valor: resumen.promedioPorCulto === null ? "Sin registros" : formatear(resumen.promedioPorCulto),
      detalle: "Asistentes por culto",
      Icono: Gauge,
    },
    {
      titulo: "Tipo de culto con mayor asistencia",
      valor: hayTipos ? tipoMayorAsistencia.map((tipo) => tipo.tipoCulto).join(" / ") : "Sin registros",
      detalle: hayTipos
        ? `Promedio de ${formatear(primerTipo.promedio)} por culto (${primerTipo.cultos} ${
            primerTipo.cultos === 1 ? "culto" : "cultos"
          })`
        : "No hay cultos en este período",
      Icono: Trophy,
    },
    {
      titulo: "Cultos registrados",
      valor: formatear(resumen.cultosRegistrados),
      detalle: "En el período seleccionado",
      Icono: CalendarDays,
    },
    {
      titulo: "Comparación con el período anterior",
      valor: hayPorcentaje
        ? `${comparacion.porcentaje > 0 ? "+" : ""}${formatear(comparacion.porcentaje)} %`
        : "Sin datos",
      detalle: detalleComparacion,
      Icono: TrendingUp,
      // verde si sube, rojo si baja; sin color si no hay porcentaje o no cambia
      tendencia:
        comparacion.porcentaje > 0 ? "positiva" : comparacion.porcentaje < 0 ? "negativa" : undefined,
    },
    {
      titulo: "Visitas",
      valor: resumen.visitas === null ? "Sin registros" : formatear(resumen.visitas),
      detalle: "Visitas registradas en el período",
      Icono: UserPlus,
    },
    {
      titulo: "Niños y adolescentes",
      valor: ninosYAdolescentes === null ? "Sin registros" : formatear(ninosYAdolescentes),
      detalle:
        ninosYAdolescentes === null
          ? "No hay cultos en este período"
          : `${formatear(resumen.ninos)} niños y ${formatear(resumen.adolescentes)} adolescentes`,
      Icono: Baby,
    },
  ];
}

export default function ResumenInicio() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  // Asi sabemos si lo que mostramos corresponde a los filtros actuales
  // o si todavia estamos esperando la respuesta de una consulta nueva.
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: "" });

  const consulta = construirConsulta(filtros);
  const cargando = consulta !== null && resultado.clave !== consulta;

  // Pide el resumen al servidor al abrir la pagina y cada vez que cambia un filtro
  useEffect(() => {
    if (consulta === null) return; // rango incompleto: no hay nada que pedir

    // "activo" descarta respuestas viejas si cambias de filtro rapido
    let activo = true;

    fetchApi(`/api/estadisticas/resumen?${consulta}`)
      .then(async (respuesta) => {
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
          // El servidor explica el problema (por ejemplo, un rango al reves)
          throw new Error(
            datos?.errores?.[0]?.mensaje ?? datos?.mensaje ?? "No se pudo cargar el resumen."
          );
        }

        if (activo) setResultado({ clave: consulta, datos, error: "" });
      })
      .catch((error) => {
        if (!activo) return;
        // fetch falla con TypeError si el servidor esta apagado
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

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((anteriores) => ({ ...anteriores, [name]: value }));
  }

  const esRango = filtros.periodo === "rango";
  const hayCambios = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  // Elegimos que mostrar debajo de los filtros segun el estado
  let contenido;

  if (consulta === null) {
    contenido = (
      <div className={filtrosUi.vacio}>
        <p>Elige la fecha inicial y la fecha final del rango.</p>
      </div>
    );
  } else if (cargando) {
    contenido = (
      <div className={filtrosUi.vacio} role="status">
        <p>Cargando resumen...</p>
      </div>
    );
  } else if (resultado.error) {
    contenido = (
      <div className={`${filtrosUi.vacio} ${filtrosUi.errorCarga}`} role="alert">
        <p className={filtrosUi.vacioTitulo}>No se pudo cargar el resumen</p>
        <p>{resultado.error}</p>
      </div>
    );
  } else {
    const datos = resultado.datos;

    contenido = (
      <>
        <p className={styles.descripcion}>
          Período: <strong>{formatearFechaCorta(datos.periodo.desde)}</strong> al{" "}
          <strong>{formatearFechaCorta(datos.periodo.hastaEfectivo)}</strong>
          {datos.periodo.enCurso && " (hasta hoy)"}. Se compara con el{" "}
          {formatearFechaCorta(datos.periodoAnterior.desde)} al{" "}
          {formatearFechaCorta(datos.periodoAnterior.hasta)}.
        </p>

        {datos.resumen.cultosRegistrados === 0 && (
          <p className={styles.avisoVacio} role="status">
            No hay cultos registrados en este período, por eso las cifras aparecen como «Sin
            registros».
          </p>
        )}

        <section className={styles.cuadricula} aria-label="Estadísticas principales">
          {construirTarjetas(datos).map((tarjeta) => (
            <TarjetaEstadistica key={tarjeta.titulo} {...tarjeta} />
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      {/* ---------- Filtro de periodo ---------- */}
      <section className={filtrosUi.filtros} aria-label="Filtro de período">
        <label className={filtrosUi.etiqueta}>
          Período
          <select
            name="periodo"
            value={filtros.periodo}
            onChange={cambiarFiltro}
            className={filtrosUi.control}
          >
            {PERIODOS.map((periodo) => (
              <option key={periodo.valor} value={periodo.valor}>
                {periodo.texto}
              </option>
            ))}
          </select>
        </label>

        {esRango ? (
          <>
            <label className={filtrosUi.etiqueta}>
              Desde
              <input
                type="date"
                name="desde"
                value={filtros.desde}
                onChange={cambiarFiltro}
                className={filtrosUi.control}
              />
            </label>

            <label className={filtrosUi.etiqueta}>
              Hasta
              <input
                type="date"
                name="hasta"
                value={filtros.hasta}
                onChange={cambiarFiltro}
                className={filtrosUi.control}
              />
            </label>
          </>
        ) : (
          <label className={filtrosUi.etiqueta}>
            Día de referencia (vacío = hoy)
            <input
              type="date"
              name="fecha"
              value={filtros.fecha}
              onChange={cambiarFiltro}
              className={filtrosUi.control}
            />
          </label>
        )}

        {hayCambios && (
          <button
            type="button"
            className={filtrosUi.limpiar}
            onClick={() => setFiltros(FILTROS_INICIALES)}
          >
            Volver al mes actual
          </button>
        )}
      </section>

      {contenido}
    </>
  );
}