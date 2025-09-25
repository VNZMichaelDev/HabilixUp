/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para producción
  reactStrictMode: true,
  
  // Mejorar HMR en desarrollo
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https:",
              "frame-src 'self'"
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Configuración de redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configuración de rewrites para URLs limpias
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ]
  },
}

module.exports = nextConfig
