import { Mail, Phone, UserRound, Info } from "lucide-react";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { contactoAdministradorDemo as contacto } from "@/lib/configuracion";
import styles from "./ayuda.module.css";

// Cada elemento de esta lista se convierte en una pregunta desplegable.
// Si se quiere agregar otra pregunta, solo se añade un elemento aquí.
const preguntas = [
  {
    pregunta: "¿Cómo inicio sesión?",
    contenido: (
      <>
        <ol className={styles.lista}>
          <li>Entra a la dirección del sistema desde tu computador o celular.</li>
          <li>Escribe el correo y la contraseña que te entregó el administrador.</li>
          <li>Pulsa el botón para ingresar.</li>
        </ol>
        <p>
          El sistema no tiene registro público. Si no tienes cuenta o olvidaste tu
          contraseña, comunícate con el administrador.
        </p>
      </>
    ),
  },
  {
    pregunta: "¿Cómo registro un culto?",
    contenido: (
      <>
        <ol className={styles.lista}>
          <li>Ve a la sección <strong>Llenar datos</strong>.</li>
          <li>Elige la fecha y el tipo de culto.</li>
          <li>
            Escribe cuántos hermanos, visitas, niños y adolescentes asistieron. Si de
            alguna categoría no hubo nadie, escribe <strong>0</strong>.
          </li>
          <li>El total de asistentes se calcula solo.</li>
          <li>Si lo tienes, completa los datos complementarios (ofrenda, predicador, tema).</li>
          <li>Pulsa <strong>Guardar registro</strong>.</li>
        </ol>
        <p>
          No se puede registrar dos veces el mismo tipo de culto en la misma fecha. Si
          necesitas corregirlo, edita el registro existente.
        </p>
      </>
    ),
  },
  {
    pregunta: "¿Cómo consulto las estadísticas?",
    contenido: (
      <p>
        Entra a <strong>Inicio</strong>. Arriba verás tarjetas con el resumen y, más abajo,
        las gráficas de la semana, del mes y del año. En las secciones mensual y anual
        puedes elegir el mes y el año que quieres consultar.
      </p>
    ),
  },
  {
    pregunta: "¿Cómo corrijo un error?",
    contenido: (
      <>
        <ol className={styles.lista}>
          <li>Ve a <strong>Ver datos</strong> y busca el registro con los filtros.</li>
          <li>Pulsa el lápiz para editarlo y corrige lo que haga falta.</li>
          <li>
            Si el registro no debía existir, pulsa la papelera. El sistema te pedirá
            confirmación antes de eliminarlo.
          </li>
        </ol>
        <p>Cada cambio queda registrado con el nombre de quien lo hizo.</p>
      </>
    ),
  },
  {
    pregunta: "¿Qué significan los indicadores?",
    contenido: (
      <ul className={styles.lista}>
        <li>
          <strong>Total acumulado:</strong> suma de los asistentes de todos los cultos del
          período.
        </li>
        <li>
          <strong>Promedio por culto:</strong> el total dividido entre el número de cultos
          registrados.
        </li>
        <li>
          <strong>Moda:</strong> el número de asistentes que más veces se repite entre los
          cultos.
        </li>
        <li>
          <strong>Sin registros:</strong> un período sin datos no es lo mismo que una
          asistencia de cero personas. Solo se cuenta como cero si alguien lo registró.
        </li>
      </ul>
    ),
  },
];

export default function AyudaPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Ayuda"
        descripcion="Instrucciones de uso y contacto del administrador."
      />

      <p className={styles.nota}>
        <Info size={18} aria-hidden="true" />
        <span>
          Estos textos son preliminares: se ajustarán cuando estén listos el inicio de
          sesión y el guardado de registros.
        </span>
      </p>

      <div className={styles.diseno}>
        <section aria-label="Preguntas frecuentes">
          {/* <details> y <summary> son etiquetas de HTML que ya traen la función de
              desplegar y plegar, sin necesidad de JavaScript. */}
          {preguntas.map((p) => (
            <details key={p.pregunta} className={styles.pregunta}>
              <summary className={styles.resumen}>{p.pregunta}</summary>
              <div className={styles.respuesta}>{p.contenido}</div>
            </details>
          ))}
        </section>

        <aside className={styles.contacto} aria-label="Contacto del administrador">
          <h2 className={styles.contactoTitulo}>Contacto del administrador</h2>
          <p className={styles.contactoTexto}>
            Escríbele o llámalo si necesitas una cuenta, una contraseña nueva o ayuda
            con un registro.
          </p>

          <ul className={styles.datosContacto}>
            <li>
              <UserRound size={18} aria-hidden="true" />
              <span>{contacto.nombre}</span>
            </li>
            <li>
              <Mail size={18} aria-hidden="true" />
              <a href={`mailto:${contacto.correo}`}>{contacto.correo}</a>
            </li>
            <li>
              <Phone size={18} aria-hidden="true" />
              {/* replace quita los espacios para que el teléfono pueda marcarse con un toque */}
              <a href={`tel:${contacto.telefono.replace(/\s/g, "")}`}>{contacto.telefono}</a>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}