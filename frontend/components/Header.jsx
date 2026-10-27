import { Menu, UserRound } from "lucide-react";
import styles from "./Header.module.css";

// onAbrirMenu: función que recibe desde PanelShell para abrir el menú en celulares
export default function Header({ onAbrirMenu }) {
  return (
    <header className={styles.header}>
      {/* Botón hamburguesa: solo se ve en pantallas pequeñas */}
      <button
        type="button"
        className={styles.botonMenu}
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <p className={styles.titulo}>Iglesia Pentecostal Unida de Colombia</p>

      {/* Perfil de usuario (datos de demostración) */}
      <div className={styles.perfil}>
        <div className={styles.datos}>
          <p className={styles.usuario}>Secretario Demo</p>
          <p className={styles.rol}>Administrador (demo)</p>
        </div>
        <span className={styles.avatar}>
          <UserRound size={20} aria-hidden="true" />
        </span>
      </div>
    </header>
  );
}