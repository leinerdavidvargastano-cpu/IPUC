import styles from "./GloboInformacion.module.css";

// Globo de información de Recharts. Recharts le pasa:
// - active:  true cuando el mouse está sobre una barra o un punto
// - payload: los datos del elemento señalado
// Los datos deben tener los campos "nombre" y "total".
export default function GloboInformacion({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const dato = payload[0].payload;

  return (
    <div className={styles.globo}>
      <p className={styles.titulo}>{dato.nombre}</p>
      <p className={styles.valor}>{dato.total} asistentes</p>
    </div>
  );
}