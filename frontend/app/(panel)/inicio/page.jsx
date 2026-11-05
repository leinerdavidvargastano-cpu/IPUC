import EncabezadoPagina from "@/components/EncabezadoPagina";
import ResumenInicio from "@/components/ResumenInicio";
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

      <ResumenInicio />
      <EstadisticasSemanales />
      <EstadisticasMensuales />
      <EstadisticasAnuales />
    </>
  );
}