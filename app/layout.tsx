import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fruver Index',
  description: 'Inteligencia de precios agrícolas para Colombia',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🥕</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
