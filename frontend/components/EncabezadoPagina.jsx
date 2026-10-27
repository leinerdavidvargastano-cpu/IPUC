import styles from "./EncabezadoPagina.module.css";

// Componente reutilizable para el título de cada sección.
// Recibe un título y una descripción como "props"
// (datos que se le pasan al componente desde afuera).
export default function EncabezadoPagina({ titulo, descripcion }) {
  return (
    <div className={styles.encabezado}>
      <h1 className={styles.titulo}>{titulo}</h1>
      <p className={styles.descripcion}>{descripcion}</p>
    </div>
  );
}