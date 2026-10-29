"use client"; // usa useState y eventos del navegador

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleAlert, Save, Eraser, Info, ArrowLeft } from "lucide-react";
import styles from "./FormularioAsistencia.module.css";
import { fetchApi } from "@/lib/api";

// Los cuatro datos que se suman para obtener el total de asistentes
const CAMPOS_NUMERICOS = [
  { nombre: "hermanos", etiqueta: "Hermanos" },
  { nombre: "visitas", etiqueta: "Visitas" },
  { nombre: "ninos", etiqueta: "Niños" },
  { nombre: "adolescentes", etiqueta: "Adolescentes" },
];

// Estado inicial: todos los campos vacios.
// Los <input> siempre entregan texto, por eso todo empieza como "".
const VALORES_INICIALES = {
  fecha: "",
  tipoCultoId: "",
  hermanos: "",
  visitas: "",
  ninos: "",
  adolescentes: "",
  ofrenda: "",
  dirigio: "",
  predico: "",
  lema: "",
  tema: "",
  observaciones: "",
};

// Expresion regular: "solo digitos del 0 al 9, uno o mas".
// Rechaza vacio, negativos (-3), decimales (1.5) y letras (abc).
const ES_ENTERO = /^\d+$/;

// Convierte un registro que viene de la API en los valores del formulario.
// Los campos del formulario son siempre texto, y los datos que no se
// registraron (null) pasan a ser texto vacio.
function valoresDesdeCulto(culto) {
  return {
    fecha: culto.fecha,
    tipoCultoId: String(culto.tipoCultoId),
    hermanos: String(culto.hermanos),
    visitas: String(culto.visitas),
    ninos: String(culto.ninos),
    adolescentes: String(culto.adolescentes),
    ofrenda: culto.ofrendaCop === null ? "" : String(culto.ofrendaCop),
    dirigio: culto.dirigio ?? "",
    predico: culto.predico ?? "",
    lema: culto.lema ?? "",
    tema: culto.tema ?? "",
    observaciones: culto.observaciones ?? "",
  };
}

// Fecha de hoy como "AAAA-MM-DD" usando la hora local del computador.
// (toISOString usaria la hora UTC y en la noche daria el dia siguiente.)
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Revisa todos los campos y devuelve un objeto con los errores encontrados.
// Si el objeto sale vacio, el formulario es valido.
// (El servidor repite estas mismas reglas: esta revision es solo comodidad.)
function validar(valores) {
  const errores = {};

  if (!valores.fecha) {
    errores.fecha = "Selecciona la fecha del culto.";
  } else if (valores.fecha > fechaDeHoy()) {
    // Las fechas en formato AAAA-MM-DD se pueden comparar como texto
    errores.fecha = "La fecha no puede ser futura.";
  }

  if (!valores.tipoCultoId) {
    errores.tipoCultoId = "Selecciona el tipo de culto.";
  }

  for (const campo of CAMPOS_NUMERICOS) {
    const texto = valores[campo.nombre].trim();
    if (texto === "") {
      errores[campo.nombre] = "Este dato es obligatorio. Si no hubo, escribe 0.";
    } else if (!ES_ENTERO.test(texto)) {
      errores[campo.nombre] = "Escribe un número entero de 0 en adelante.";
    }
  }

  // La ofrenda es opcional, pero si se escribe debe ser un numero valido
  const ofrenda = valores.ofrenda.trim();
  if (ofrenda !== "" && !ES_ENTERO.test(ofrenda)) {
    errores.ofrenda = "Escribe solo números, sin puntos, comas ni signos.";
  }

  return errores;
}

// Convierte lo que hay en el formulario (todo texto) en el objeto que
// espera la API: numeros donde corresponde y null en la ofrenda vacia.
function armarCuerpo(valores) {
  const ofrenda = valores.ofrenda.trim();

  return {
    fecha: valores.fecha,
    tipoCultoId: Number(valores.tipoCultoId),
    hermanos: Number(valores.hermanos.trim()),
    visitas: Number(valores.visitas.trim()),
    ninos: Number(valores.ninos.trim()),
    adolescentes: Number(valores.adolescentes.trim()),
    ofrendaCop: ofrenda === "" ? null : Number(ofrenda),
    dirigio: valores.dirigio,
    predico: valores.predico,
    lema: valores.lema,
    tema: valores.tema,
    observaciones: valores.observaciones,
  };
}

// Una "fila" del formulario: etiqueta + campo + mensaje de ayuda o de error.
// Esta FUERA del componente principal a proposito: si se definiera adentro,
// React lo recrearia en cada letra que escribes y el cursor se saldria del campo.
function Campo({ id, etiqueta, obligatorio, error, ayuda, completo, children }) {
  return (
    <div className={`${styles.campo} ${completo ? styles.completo : ""}`}>
      <label htmlFor={id} className={styles.etiqueta}>
        {etiqueta}
        {obligatorio ? (
          <span className={styles.obligatorio}> *</span>
        ) : (
          <span className={styles.opcional}> (opcional)</span>
        )}
      </label>
      {children}
      {ayuda && !error && <p className={styles.ayuda}>{ayuda}</p>}
      {error && (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

// "culto" es opcional: si llega un registro, el formulario entra en MODO EDICION;
// si no llega, funciona como siempre para registrar un culto nuevo.
export default function FormularioAsistencia({ culto }) {
  const modoEdicion = Boolean(culto);

  // "valoresBase" son los valores a los que vuelve el boton de limpiar o deshacer:
  // vacio al crear, o los datos guardados del registro al editar.
  const [valoresBase, setValoresBase] = useState(() =>
    culto ? valoresDesdeCulto(culto) : VALORES_INICIALES
  );
  const [valores, setValores] = useState(valoresBase);
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");
  // Error general que llega del servidor (duplicado, servidor apagado...)
  const [errorServidor, setErrorServidor] = useState("");
  // true mientras se espera la respuesta del servidor
  const [guardando, setGuardando] = useState(false);

  // Tipos de culto que vienen de la base de datos a traves de la API.
  // estadoTipos puede ser: "cargando", "listo" o "error".
  const [tipos, setTipos] = useState([]);
  const [estadoTipos, setEstadoTipos] = useState("cargando");

  // useEffect con [] al final se ejecuta UNA vez, cuando el formulario aparece.
  useEffect(() => {
    // "activo" evita actualizar el estado si el componente ya desaparecio
    let activo = true;

    fetchApi("/api/tipos-culto")
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Respuesta no valida");
        return respuesta.json();
      })
      .then((datos) => {
        if (activo) {
          setTipos(datos);
          setEstadoTipos("listo");
        }
      })
      .catch(() => {
        if (activo) setEstadoTipos("error");
      });

    return () => {
      activo = false;
    };
  }, []);

  // El total NO se guarda en el estado: se calcula en cada dibujo a partir
  // de los valores. Asi nunca queda desincronizado con las categorias.
  const total = CAMPOS_NUMERICOS.reduce((suma, campo) => {
    const texto = valores[campo.nombre].trim();
    return ES_ENTERO.test(texto) ? suma + Number(texto) : suma;
  }, 0);

  // Se ejecuta cada vez que el usuario escribe en cualquier campo.
  function cambiar(evento) {
    const { name, value } = evento.target;

    // [name] usa el texto de la variable como nombre de la propiedad.
    // {...anteriores} copia todos los valores actuales y solo cambia el que toco.
    setValores((anteriores) => ({ ...anteriores, [name]: value }));

    // Al corregir un campo, quitamos su mensaje de error
    setErrores((anteriores) => {
      if (!anteriores[name]) return anteriores;
      const copia = { ...anteriores };
      delete copia[name];
      return copia;
    });

    setMensajeExito("");
    setErrorServidor("");
  }

  // Atajo: devuelve todas las propiedades comunes de un campo.
  function propsCampo(nombre) {
    return {
      id: nombre,
      name: nombre,
      value: valores[nombre],
      onChange: cambiar,
      className: errores[nombre]
        ? `${styles.entrada} ${styles.entradaError}`
        : styles.entrada,
      "aria-invalid": errores[nombre] ? "true" : undefined,
      "aria-describedby": errores[nombre] ? `${nombre}-error` : undefined,
    };
  }

  // "async" permite usar "await": esperar la respuesta del servidor
  // sin congelar la pagina.
  async function enviar(evento) {
    evento.preventDefault(); // evita que el navegador recargue la pagina
    setMensajeExito("");
    setErrorServidor("");

    // 1) Revision rapida en el navegador
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // 2) Enviar al servidor: PUT para reemplazar un registro, POST para crear uno
    setGuardando(true);
    try {
      const respuesta = await fetchApi(
        modoEdicion ? `/api/cultos/${culto.id}` : "/api/cultos",
        {
          method: modoEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(armarCuerpo(valores)),
        }
      );
      const datos = await respuesta.json();

      // 201 = creado, 200 = modificado: todo salio bien
      if (respuesta.status === 201 || respuesta.status === 200) {
        if (modoEdicion) {
          setMensajeExito("Cambios guardados correctamente.");
          // Lo que acabamos de guardar pasa a ser el nuevo "punto de partida"
          setValoresBase(valores);
        } else {
          setMensajeExito(
            `Culto guardado correctamente: ${datos.totalAsistentes} asistentes.`
          );
          setValores(VALORES_INICIALES);
        }
        return;
      }

      // 400 = el servidor rechazo algun campo: lo mostramos junto a ese campo
      if (respuesta.status === 400 && Array.isArray(datos.errores)) {
        const delServidor = {};
        for (const problema of datos.errores) {
          // En la API la ofrenda se llama "ofrendaCop"; en el formulario, "ofrenda"
          const campo = problema.campo === "ofrendaCop" ? "ofrenda" : problema.campo;
          delServidor[campo] = problema.mensaje;
        }
        setErrores(delServidor);
        return;
      }

      // Cualquier otro caso (409 duplicado, 404 ya no existe...): mensaje general
      setErrorServidor(datos.mensaje || "No se pudo guardar el registro.");
    } catch {
      // fetch falla si el servidor esta apagado o no responde
      setErrorServidor(
        "No se pudo conectar con el servidor. Revisa que esté encendido e inténtalo de nuevo."
      );
    } finally {
      // finally se ejecuta SIEMPRE, haya salido bien o mal
      setGuardando(false);
    }
  }

  // Al crear: deja todo vacio. Al editar: vuelve a los ultimos datos guardados.
  function limpiar() {
    setValores(valoresBase);
    setErrores({});
    setMensajeExito("");
    setErrorServidor("");
  }

  const cantidadErrores = Object.keys(errores).length;

  return (
    // noValidate desactiva los avisos automaticos del navegador
    // para mostrar nuestros propios mensajes en español.
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <p className={styles.aviso}>
        <Info size={18} aria-hidden="true" />
        <span>
          {modoEdicion ? "Estás editando un registro existente. " : ""}
          Los campos con <strong>*</strong> son obligatorios.
        </span>
      </p>

      {mensajeExito && (
        <p className={styles.mensajeExito} role="status">
          <CircleCheck size={20} aria-hidden="true" />
          <span>{mensajeExito}</span>
        </p>
      )}

      {errorServidor && (
        <p className={styles.mensajeError} role="alert">
          <CircleAlert size={20} aria-hidden="true" />
          <span>{errorServidor}</span>
        </p>
      )}

      {cantidadErrores > 0 && (
        <p className={styles.mensajeError} role="alert">
          <CircleAlert size={20} aria-hidden="true" />
          <span>
            Revisa los {cantidadErrores} campo(s) marcados en rojo antes de guardar.
          </span>
        </p>
      )}

      {/* ---------- Datos obligatorios ---------- */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos del culto</h2>

        <div className={styles.cuadricula}>
          <Campo id="fecha" etiqueta="Fecha del culto" obligatorio error={errores.fecha}>
            <input type="date" {...propsCampo("fecha")} />
          </Campo>

          <Campo
            id="tipoCultoId"
            etiqueta="Tipo de culto"
            obligatorio
            error={
              errores.tipoCultoId ||
              (estadoTipos === "error"
                ? "No se pudieron cargar los tipos de culto. Revisa que el servidor esté encendido y recarga la página."
                : undefined)
            }
          >
            {/* Mientras carga o si falla, la lista queda desactivada */}
            <select {...propsCampo("tipoCultoId")} disabled={estadoTipos !== "listo"}>
              <option value="">
                {estadoTipos === "cargando"
                  ? "Cargando tipos de culto..."
                  : "Selecciona un tipo de culto"}
              </option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </Campo>

          {CAMPOS_NUMERICOS.map((campo) => (
            <Campo
              key={campo.nombre}
              id={campo.nombre}
              etiqueta={`Número de ${campo.etiqueta.toLowerCase()}`}
              obligatorio
              error={errores[campo.nombre]}
            >
              {/* type="text" con inputMode="numeric": en el celular abre el teclado
                  de numeros, y nosotros controlamos los mensajes de error. */}
              <input type="text" inputMode="numeric" placeholder="0" {...propsCampo(campo.nombre)} />
            </Campo>
          ))}
        </div>

        <div className={styles.total} aria-live="polite">
          <div>
            <p className={styles.totalTitulo}>Total de asistentes</p>
            <p className={styles.totalTexto}>
              Se calcula solo: hermanos + visitas + niños + adolescentes
            </p>
          </div>
          <p className={styles.totalNumero}>{total}</p>
        </div>
      </section>

      {/* ---------- Datos opcionales ---------- */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos complementarios</h2>
        <p className={styles.seccionDescripcion}>
          No son necesarios para calcular la asistencia.
        </p>

        <div className={styles.cuadricula}>
          <Campo
            id="ofrenda"
            etiqueta="Valor total de la ofrenda (COP)"
            error={errores.ofrenda}
            ayuda="Solo números, sin puntos ni comas. Ejemplo: 150000"
          >
            <input type="text" inputMode="numeric" placeholder="0" {...propsCampo("ofrenda")} />
          </Campo>

          <Campo id="dirigio" etiqueta="Persona que dirigió el culto" error={errores.dirigio}>
            <input type="text" maxLength={100} {...propsCampo("dirigio")} />
          </Campo>

          <Campo id="predico" etiqueta="Persona que predicó" error={errores.predico}>
            <input type="text" maxLength={100} {...propsCampo("predico")} />
          </Campo>

          <Campo id="lema" etiqueta="Lema del culto" error={errores.lema}>
            <input type="text" maxLength={150} {...propsCampo("lema")} />
          </Campo>

          <Campo id="tema" etiqueta="Tema de la predicación" error={errores.tema} completo>
            <input type="text" maxLength={150} {...propsCampo("tema")} />
          </Campo>

          <Campo
            id="observaciones"
            etiqueta="Observaciones adicionales"
            error={errores.observaciones}
            completo
          >
            <textarea rows={4} maxLength={500} {...propsCampo("observaciones")} />
          </Campo>
        </div>
      </section>

      <div className={styles.acciones}>
        <button type="submit" className={styles.botonPrimario} disabled={guardando}>
          <Save size={18} aria-hidden="true" />
          {guardando
            ? "Guardando..."
            : modoEdicion
              ? "Guardar cambios"
              : "Guardar registro"}
        </button>
        <button type="button" className={styles.botonSecundario} onClick={limpiar}>
          <Eraser size={18} aria-hidden="true" />
          {modoEdicion ? "Deshacer cambios" : "Limpiar formulario"}
        </button>
        {modoEdicion && (
          <Link href="/ver-datos" className={styles.botonSecundario}>
            <ArrowLeft size={18} aria-hidden="true" />
            Volver a Ver datos
          </Link>
        )}
      </div>
    </form>
  );
}