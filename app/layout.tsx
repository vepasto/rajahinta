import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
if (!siteUrl) {
  throw new Error('NEXT_PUBLIC_SITE_URL environment variable is required')
}

export const metadata: Metadata = {
  title: 'Hitas hintalaskuri',
  description: 'Laske Hitas-asuntosi nykyinen velaton enimmäishinta käyttäen virallisia rakennuskustannus- ja markkinahintaindeksejä.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    url: siteUrl,
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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

