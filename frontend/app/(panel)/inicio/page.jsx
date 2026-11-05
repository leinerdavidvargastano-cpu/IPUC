import EncabezadoPagina from "@/components/EncabezadoPagina";
import PanelInicio from "@/components/PanelInicio";
import EstadisticasSemanales from "@/components/EstadisticasSemanales";
import EstadisticasMensuales from "@/components/EstadisticasMensuales";
import EstadisticasAnuales from "@/components/EstadisticasAnuales";

export default function InicioPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion="Resumen de la asistencia de la congregación."
      />

      {/* Filtro de periodo + tarjetas + grafica general */}
      <PanelInicio />

      <EstadisticasSemanales />
      <EstadisticasMensuales />
      <EstadisticasAnuales />
    </>
  );
}