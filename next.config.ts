import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esto le dice a Firebase que prepare el sitio para un servidor
  output: 'standalone', 

  images: {
    // Aquí corregimos el error que te marcaba el log
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Esto permite imágenes de cualquier sitio seguro
      },
    ],
  },
  // Mantenemos las reglas básicas de Next.js
  reactStrictMode: true,
};

export default nextConfig;