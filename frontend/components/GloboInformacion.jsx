import styles from "./GloboInformacion.module.css";

// Globo de informacion de Recharts. Recharts le pasa:
// - active:  true cuando el mouse esta sobre una barra o un punto
// - payload: los datos del elemento senalado
// Los datos deben tener "nombre" y "total", y pueden tener "detalle" (por ejemplo, la fecha).
// Un total null significa "sin registro": no es lo mismo que cero asistentes.
export default function GloboInformacion({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const dato = payload[0].payload;

  return (
    <div className={styles.globo}>
      <p className={styles.titulo}>{dato.nombre}</p>
      {dato.detalle && <p className={styles.titulo}>{dato.detalle}</p>}
      <p className={styles.valor}>
        {dato.total === null ? "Sin registro" : `${dato.total} asistentes`}
      </p>
    </div>
  );
}