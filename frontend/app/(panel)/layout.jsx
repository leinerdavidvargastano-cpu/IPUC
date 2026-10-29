import PanelShell from "@/components/PanelShell";
import SesionProvider from "@/components/SesionProvider";

// Este layout envuelve todas las paginas dentro de la carpeta (panel).
// Los parentesis hacen que "panel" NO aparezca en la URL.
// SesionProvider comprueba que haya una sesion abierta antes de mostrar nada.
export default function PanelLayout({ children }) {
  return (
    <SesionProvider>
      <PanelShell>{children}</PanelShell>
    </SesionProvider>
  );
}