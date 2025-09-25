import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HabilixUp - Plataforma de Cursos Online',
  description: 'Aprende nuevas habilidades con nuestros cursos interactivos',
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon.png',
    },
    {
      rel: 'icon',
      type: 'image/png', 
      sizes: '16x16',
      url: '/favicon.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicon.png',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
