import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // <--- AÑADE ESTA LÍNEA
  images: {
    unoptimized: true, // <--- Y ESTA TAMBIÉN (necesaria para exportar)
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'placehold.co',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      port: '',
      pathname: '/**',
    },
  ],
};

export default nextConfig;
