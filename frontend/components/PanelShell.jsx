"use client"; // Usa useState, que solo funciona en componentes de cliente (el navegador)

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./PanelShell.module.css";

export default function PanelShell({ children }) {
  // useState crea una "variable con memoria":
  // menuAbierto -> valor actual (true/false)
  // setMenuAbierto -> función para cambiarlo (React vuelve a dibujar al cambiar)
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className={styles.contenedor}>
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className={styles.columna}>
        <Header onAbrirMenu={() => setMenuAbierto(true)} />
        {/* Aquí se muestra la página activa (Inicio, Llenar datos, etc.) */}
        <main className={styles.principal}>{children}</main>
      </div>
    </div>
  );
}