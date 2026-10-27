// Layout raíz: todo lo que se muestre en la app pasa por aquí.
import "./globals.css"; // cargamos los estilos globales una sola vez

// "metadata" define el título que aparece en la pestaña del navegador
export const metadata = {
  title: "Sistema de Asistencia IPUC",
  description: "Registro y estadísticas de asistencia a los cultos",
};

export default function RootLayout({ children }) {
  // "children" es la página que Next.js esté mostrando en ese momento
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}