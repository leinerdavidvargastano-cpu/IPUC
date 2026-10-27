import styles from "./TarjetaEstadistica.module.css";

// Props que recibe:
// - titulo:    nombre de la estadística (ej. "Promedio de asistencia")
// - valor:     el número o texto grande que se destaca
// - detalle:   texto pequeño de apoyo debajo del valor
// - Icono:     el componente del icono (viene de lucide-react)
// - tendencia: opcional, "positiva" o "negativa" para colorear el valor
export default function TarjetaEstadistica({ titulo, valor, detalle, Icono, tendencia }) {
  // Si hay tendencia, agregamos una clase extra para pintar el valor de verde o rojo
  const claseValor = `${styles.valor} ${tendencia ? styles[tendencia] : ""}`;

  return (
    <article className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <h3 className={styles.titulo}>{titulo}</h3>
        <span className={styles.icono}>
          <Icono size={20} aria-hidden="true" />
        </span>
      </div>
      <p className={claseValor}>{valor}</p>
      <p className={styles.detalle}>{detalle}</p>
    </article>
  );
}