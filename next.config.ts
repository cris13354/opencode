import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // La ruta de imágenes lee los SVG de Twemoji del disco: hay que incluirlos
  // explícitamente en el paquete que se despliega (Vercel u otros).
  outputFileTracingIncludes: {
    "/api/card": ["./node_modules/@twemoji/svg/*.svg", "./src/assets/fonts/*.ttf"],
  },
  // Cabeceras de seguridad básicas para todas las páginas.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
