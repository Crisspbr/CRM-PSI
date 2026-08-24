import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica CRM',
  description:
    'CRM clínico para organizar pacientes, prontuários, agenda e acompanhamento.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#d9b42d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className="bg-background"
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
