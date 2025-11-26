import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Hitas hintalaskuri',
  description: 'Laske Hitas-asuntosi nykyinen velaton enimmäishinta käyttäen virallisia rakennuskustannus- ja markkinahintaindeksejä.',
  metadataBase: new URL('https://hitas-hinta.fi'),
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    url: 'https://hitas-hinta.fi',
    title: 'Hitas hintalaskuri',
    description: 'Laske Hitas-asuntosi nykyinen velaton enimmäishinta käyttäen virallisia rakennuskustannus- ja markkinahintaindeksejä.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Valkoinen talo-ikoni violettisella gradient-taustalla',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Valkoinen talo-ikoni violettisella gradient-taustalla',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hitas hintalaskuri',
    description: 'Laske Hitas-asuntosi nykyinen velaton enimmäishinta käyttäen virallisia rakennuskustannus- ja markkinahintaindeksejä.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: {
      url: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3ClinearGradient id=\'bg\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23667eea\'/%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23764ba2\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23bg)\'/%3E%3Cg fill=\'white\'%3E%3Cpath d=\'M50 25 L70 45 L70 75 L30 75 L30 45 Z\'/%3E%3Crect x=\'40\' y=\'55\' width=\'8\' height=\'12\'/%3E%3Crect x=\'52\' y=\'55\' width=\'8\' height=\'12\'/%3E%3C/g%3E%3C/svg%3E',
      type: 'image/svg+xml',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fi">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hitas hintalaskuri" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  )
}

