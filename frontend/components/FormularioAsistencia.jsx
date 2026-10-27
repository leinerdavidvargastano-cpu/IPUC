"use client"; // usa useState y eventos del navegador

import { useState } from "react";
import { CircleCheck, CircleAlert, Save, Eraser, Info } from "lucide-react";
import { tiposCultoDemo } from "@/lib/datosDemo";
import styles from "./FormularioAsistencia.module.css";

// Los cuatro datos que se suman para obtener el total de asistentes
const CAMPOS_NUMERICOS = [
  { nombre: "hermanos", etiqueta: "Hermanos" },
  { nombre: "visitas", etiqueta: "Visitas" },
  { nombre: "ninos", etiqueta: "Niños" },
  { nombre: "adolescentes", etiqueta: "Adolescentes" },
];

// Estado inicial: todos los campos vacíos.
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

// Expresión regular: "solo dígitos del 0 al 9, uno o más".
// Rechaza vacío, negativos (-3), decimales (1.5) y letras (abc).
const ES_ENTERO = /^\d+$/;

// Fecha de hoy como "AAAA-MM-DD" usando la hora local del computador.
// (toISOString usaría la hora UTC y en la noche daría el día siguiente.)
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Revisa todos los campos y devuelve un objeto con los errores encontrados.
// Si el objeto sale vacío, el formulario es válido.
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

  // La ofrenda es opcional, pero si se escribe debe ser un número válido
  const ofrenda = valores.ofrenda.trim();
  if (ofrenda !== "" && !ES_ENTERO.test(ofrenda)) {
    errores.ofrenda = "Escribe solo números, sin puntos, comas ni signos.";
  }

  return errores;
}

// Una "fila" del formulario: etiqueta + campo + mensaje de ayuda o de error.
// Está FUERA del componente principal a propósito: si se definiera adentro,
// React lo recrearía en cada letra que escribes y el cursor se saldría del campo.
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

export default function FormularioAsistencia() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");

  // El total NO se guarda en el estado: se calcula en cada dibujo a partir
  // de los valores. Así nunca queda desincronizado con las categorías.
  const total = CAMPOS_NUMERICOS.reduce((suma, campo) => {
    const texto = valores[campo.nombre].trim();
    return ES_ENTERO.test(texto) ? suma + Number(texto) : suma;
  }, 0);

  // Se ejecuta cada vez que el usuario escribe en cualquier campo.
  // name -> nombre del campo; value -> lo que escribió.
  function cambiar(evento) {
    const { name, value } = evento.target;

    // [name] usa el texto de la variable como nombre de la propiedad.
    // {...anteriores} copia todos los valores actuales y solo cambia el que tocó.
    setValores((anteriores) => ({ ...anteriores, [name]: value }));

    // Al corregir un campo, quitamos su mensaje de error
    setErrores((anteriores) => {
      if (!anteriores[name]) return anteriores;
      const copia = { ...anteriores };
      delete copia[name];
      return copia;
    });

    setMensajeExito("");
  }

  // Atajo: devuelve todas las propiedades comunes de un campo.
  // Se usa con {...propsCampo("fecha")} (el "spread" reparte las propiedades).
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

  function enviar(evento) {
    evento.preventDefault(); // evita que el navegador recargue la página

    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeExito("");
      return; // hay errores: no seguimos
    }

    // FASE 5: aquí enviaremos el registro a la API para guardarlo en la base de datos.
    setMensajeExito(
      `Los datos son válidos: ${total} asistentes. (Demostración: todavía no se guardan en la base de datos.)`
    );
    setValores(VALORES_INICIALES);
  }

  function limpiar() {
    setValores(VALORES_INICIALES);
    setErrores({});
    setMensajeExito("");
  }

  const cantidadErrores = Object.keys(errores).length;

  return (
    // noValidate desactiva los avisos automáticos del navegador
    // para mostrar nuestros propios mensajes en español.
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <p className={styles.aviso}>
        <Info size={18} aria-hidden="true" />
        <span>
          <strong>Demostración:</strong> el formulario valida los datos, pero aún no los
          guarda. Los campos con <strong>*</strong> son obligatorios.
        </span>
      </p>

      {mensajeExito && (
        <p className={styles.mensajeExito} role="status">
          <CircleCheck size={20} aria-hidden="true" />
          <span>{mensajeExito}</span>
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
            error={errores.tipoCultoId}
          >
            <select {...propsCampo("tipoCultoId")}>
              <option value="">Selecciona un tipo de culto</option>
              {tiposCultoDemo.map((tipo) => (
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
                  de números, y nosotros controlamos los mensajes de error. */}
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

          <Campo id="dirigio" etiqueta="Persona que dirigió el culto">
            <input type="text" maxLength={100} {...propsCampo("dirigio")} />
          </Campo>

          <Campo id="predico" etiqueta="Persona que predicó">
            <input type="text" maxLength={100} {...propsCampo("predico")} />
          </Campo>

          <Campo id="lema" etiqueta="Lema del culto">
            <input type="text" maxLength={150} {...propsCampo("lema")} />
          </Campo>

          <Campo id="tema" etiqueta="Tema de la predicación" completo>
            <input type="text" maxLength={150} {...propsCampo("tema")} />
          </Campo>

          <Campo id="observaciones" etiqueta="Observaciones adicionales" completo>
            <textarea rows={4} maxLength={500} {...propsCampo("observaciones")} />
          </Campo>
        </div>
      </section>

      <div className={styles.acciones}>
        <button type="submit" className={styles.botonPrimario}>
          <Save size={18} aria-hidden="true" />
          Guardar registro
        </button>
        <button type="button" className={styles.botonSecundario} onClick={limpiar}>
          <Eraser size={18} aria-hidden="true" />
          Limpiar formulario
        </button>
      </div>
    </form>
  );
}