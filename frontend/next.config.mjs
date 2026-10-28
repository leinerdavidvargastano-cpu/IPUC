// Direccion del backend. Mas adelante, en produccion, se cambiara
// con una variable de entorno sin tocar el codigo.
const URL_BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Los "rewrites" reenvian peticiones sin que el navegador se entere:
  // lo que llega a /api/algo en el puerto 3000 se atiende en el backend.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${URL_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;