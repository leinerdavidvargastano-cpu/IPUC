import EncabezadoPagina from "@/components/EncabezadoPagina";
import PanelCuentas from "@/components/PanelCuentas";

export default function CuentasPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Cuentas"
        descripcion="Crea y administra las cuentas de los secretarios."
      />
      <PanelCuentas />
    </>
  );
}