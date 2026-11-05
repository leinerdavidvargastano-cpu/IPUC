import { Info } from "lucide-react";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import ResumenInicio from "@/components/ResumenInicio";
import EstadisticasSemanales from "@/components/EstadisticasSemanales";
import EstadisticasMensuales from "@/components/EstadisticasMensuales";
import EstadisticasAnuales from "@/components/EstadisticasAnuales";
import styles from "./inicio.module.css";

export default function InicioPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion="Resumen de la asistencia de la congregación."
      />

      {/* Tarjetas con datos REALES */}
      <ResumenInicio />

      {/* Las graficas todavia usan datos de demostracion */}
      <p className={styles.aviso} style={{ marginTop: 40, marginBottom: 0 }}>
        <Info size={18} aria-hidden="true" />
        <span>
          <strong>Datos de demostración:</strong> las gráficas de abajo todavía usan cifras
          ficticias. Se conectan en los próximos pasos.
        </span>
      </p>

      <EstadisticasSemanales />
      <EstadisticasMensuales />
      <EstadisticasAnuales />
    </>
  );
}