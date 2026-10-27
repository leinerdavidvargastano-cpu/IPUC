import PanelShell from "@/components/PanelShell";

// Este layout envuelve todas las páginas dentro de la carpeta (panel).
// Los paréntesis hacen que "panel" NO aparezca en la URL:
// app/(panel)/inicio/page.jsx  ->  /inicio
export default function PanelLayout({ children }) {
  return <PanelShell>{children}</PanelShell>;
}