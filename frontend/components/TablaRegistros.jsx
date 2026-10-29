"use client"; // usa estado y eventos del navegador

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, CircleCheck } from "lucide-react";
import Modal from "./Modal";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import styles from "./TablaRegistros.module.css";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Los ultimos 6 anios, empezando por el actual (solucion sencilla por ahora)
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 6 }, (_, indice) => ANIO_ACTUAL - indice);

const ORDENES = [
  { valor: "fecha-desc", texto: "Fecha: más recientes primero" },
  { valor: "fecha-asc", texto: "Fecha: más antiguos primero" },
  { valor: "total-desc", texto: "Asistencia: de mayor a menor" },
  { valor: "total-asc", texto: "Asistencia: de menor a mayor" },
];

const FILTROS_INICIALES = { fecha: "", tipo: "", mes: "", anio: "", orden: "fecha-desc" };

// Convierte los filtros en el texto que va despues del "?" de la direccion.
// Ejemplo: "anio=2026&mes=10&orden=fecha-desc".
// Los filtros vacios no se envian.
function construirConsulta(filtros) {
  const parametros = new URLSearchParams();
  if (filtros.fecha) parametros.set("fecha", filtros.fecha);
  if (filtros.tipo) parametros.set("tipoCultoId", filtros.tipo);
  if (filtros.mes) parametros.set("mes", filtros.mes);
  if (filtros.anio) parametros.set("anio", filtros.anio);
  parametros.set("orden", filtros.orden);
  return parametros.toString();
}

export default function TablaRegistros() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [tipos, setTipos] = useState([]); // para el filtro "Tipo de culto"
  const [detalle, setDetalle] = useState(null); // registro que se esta viendo, o null
  const [porEliminar, setPorEliminar] = useState(null); // registro pendiente de confirmar
  const [aviso, setAviso] = useState("");

  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  // Asi sabemos si lo que mostramos corresponde a los filtros actuales
  // o si todavia estamos esperando la respuesta de una consulta nueva.
  const [resultado, setResultado] = useState({ clave: null, datos: [], error: false });

  const clave = construirConsulta(filtros);
  const cargando = resultado.clave !== clave;

  // Lista de tipos de culto para el filtro (una sola vez)
  useEffect(() => {
    let activo = true;

    fetch("/api/tipos-culto")
      .then((respuesta) => (respuesta.ok ? respuesta.json() : []))
      .then((datos) => {
        if (activo) setTipos(datos);
      })
      .catch(() => {}); // si falla, el filtro solo mostrara "Todos"

    return () => {
      activo = false;
    };
  }, []);

  // Pide los cultos al servidor. Se ejecuta al abrir la pagina y cada vez
  // que cambia "clave", es decir, cada vez que cambia un filtro.
  useEffect(() => {
    // "activo" descarta respuestas viejas: si cambias un filtro dos veces
    // rapido, solo cuenta la respuesta de la ultima consulta.
    let activo = true;

    fetch(`/api/cultos?${clave}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Respuesta no valida");
        return respuesta.json();
      })
      .then((datos) => {
        if (activo) setResultado({ clave, datos, error: false });
      })
      .catch(() => {
        if (activo) setResultado({ clave, datos: [], error: true });
      });

    return () => {
      activo = false;
    };
  }, [clave]);

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((anteriores) => ({ ...anteriores, [name]: value }));
  }

  const registros = resultado.datos;
  const hayFiltros = filtros.fecha || filtros.tipo || filtros.mes || filtros.anio;

  function pedirEdicion() {
    setAviso("La edición se conectará en uno de los próximos pasos.");
  }

  function confirmarEliminar() {
    // TODO: conectar con la API (se hace en un paso posterior)
    setAviso("La eliminación todavía no está conectada: el registro no se borró.");
    setPorEliminar(null);
  }

  // Datos que se muestran en la ventana de detalle
  const filasDetalle = detalle
    ? [
        ["Fecha", formatearFecha(detalle.fecha)],
        ["Tipo de culto", detalle.tipoCulto],
        ["Hermanos", detalle.hermanos],
        ["Visitas", detalle.visitas],
        ["Niños", detalle.ninos],
        ["Adolescentes", detalle.adolescentes],
        ["Total de asistentes", detalle.totalAsistentes],
        // null = no se registro (distinto de 0)
        ["Ofrenda", detalle.ofrendaCop !== null ? formatearPesos(detalle.ofrendaCop) : "No registrada"],
        ["Dirigió el culto", detalle.dirigio || "No registrado"],
        ["Predicó", detalle.predico || "No registrado"],
        ["Lema", detalle.lema || "No registrado"],
        ["Tema de la predicación", detalle.tema || "No registrado"],
        ["Observaciones", detalle.observaciones || "Sin observaciones"],
        ["Registrado por", detalle.registradoPor],
      ]
    : [];

  // Elegimos que mostrar debajo de los filtros segun el estado
  let contenido;

  if (cargando) {
    contenido = (
      <div className={styles.vacio} role="status">
        <p>Cargando registros...</p>
      </div>
    );
  } else if (resultado.error) {
    contenido = (
      <div className={`${styles.vacio} ${styles.errorCarga}`} role="alert">
        <p className={styles.vacioTitulo}>No se pudieron cargar los registros</p>
        <p>Revisa que el servidor esté encendido y recarga la página.</p>
      </div>
    );
  } else if (registros.length === 0) {
    contenido = (
      <div className={styles.vacio}>
        <p className={styles.vacioTitulo}>No hay registros para mostrar</p>
        <p>
          {hayFiltros
            ? "Ningún registro coincide con los filtros elegidos."
            : "Todavía no se ha registrado ningún culto."}
        </p>
      </div>
    );
  } else {
    contenido = (
      // El contenedor permite hacer scroll horizontal en pantallas pequenas
      <div className={styles.contenedorTabla}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Tipo de culto</th>
              <th scope="col" className={styles.numero}>Hermanos</th>
              <th scope="col" className={styles.numero}>Visitas</th>
              <th scope="col" className={styles.numero}>Niños</th>
              <th scope="col" className={styles.numero}>Adolesc.</th>
              <th scope="col" className={styles.numero}>Total</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => {
              // Texto que identifica al registro para los lectores de pantalla
              const descripcion = `${r.tipoCulto} del ${formatearFecha(r.fecha)}`;
              return (
                <tr key={r.id}>
                  <td>{formatearFecha(r.fecha)}</td>
                  <td>{r.tipoCulto}</td>
                  <td className={styles.numero}>{r.hermanos}</td>
                  <td className={styles.numero}>{r.visitas}</td>
                  <td className={styles.numero}>{r.ninos}</td>
                  <td className={styles.numero}>{r.adolescentes}</td>
                  <td className={`${styles.numero} ${styles.total}`}>{r.totalAsistentes}</td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        type="button"
                        className={styles.accion}
                        onClick={() => setDetalle(r)}
                        aria-label={`Ver detalle: ${descripcion}`}
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.accion}
                        onClick={pedirEdicion}
                        aria-label={`Editar: ${descripcion}`}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.accion} ${styles.peligro}`}
                        onClick={() => setPorEliminar(r)}
                        aria-label={`Eliminar: ${descripcion}`}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {aviso && (
        <p className={styles.mensaje} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}

      {/* ---------- Filtros ---------- */}
      <section className={styles.filtros} aria-label="Filtros">
        <label className={styles.etiqueta}>
          Buscar por fecha
          <input
            type="date"
            name="fecha"
            value={filtros.fecha}
            onChange={cambiarFiltro}
            className={styles.control}
          />
        </label>

        <label className={styles.etiqueta}>
          Tipo de culto
          <select name="tipo" value={filtros.tipo} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Mes
          <select name="mes" value={filtros.mes} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {/* En la API los meses van de 1 (enero) a 12 (diciembre) */}
            {MESES.map((nombre, indice) => (
              <option key={nombre} value={indice + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Año
          <select name="anio" value={filtros.anio} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {ANIOS.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Ordenar por
          <select name="orden" value={filtros.orden} onChange={cambiarFiltro} className={styles.control}>
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </label>

        {hayFiltros && (
          <button
            type="button"
            className={styles.limpiar}
            onClick={() => setFiltros({ ...FILTROS_INICIALES, orden: filtros.orden })}
          >
            Limpiar filtros
          </button>
        )}
      </section>

      {!cargando && !resultado.error && (
        <p className={styles.contador}>
          {registros.length} {registros.length === 1 ? "registro encontrado" : "registros encontrados"}
        </p>
      )}

      {contenido}

      {/* ---------- Ventana de detalle ---------- */}
      {detalle && (
        <Modal titulo="Detalle del registro" onCerrar={() => setDetalle(null)}>
          <dl className={styles.detalle}>
            {filasDetalle.map(([etiqueta, valor]) => (
              <div key={etiqueta} className={styles.filaDetalle}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}

      {/* ---------- Confirmacion antes de eliminar ---------- */}
      {porEliminar && (
        <Modal titulo="¿Eliminar este registro?" onCerrar={() => setPorEliminar(null)}>
          <p className={styles.textoConfirmar}>
            Vas a eliminar el registro de <strong>{porEliminar.tipoCulto}</strong> del{" "}
            <strong>{formatearFecha(porEliminar.fecha)}</strong> ({porEliminar.totalAsistentes}{" "}
            asistentes).
          </p>
          <div className={styles.botonesConfirmar}>
            <button type="button" className={styles.cancelar} onClick={() => setPorEliminar(null)}>
              Cancelar
            </button>
            <button type="button" className={styles.eliminar} onClick={confirmarEliminar}>
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}