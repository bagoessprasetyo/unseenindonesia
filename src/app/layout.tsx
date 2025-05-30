import type { Metadata } from 'next'
import { Inter, Nunito_Sans, Playfair_Display } from 'next/font/google'
// import { Providers } from '@/components/providers/Providers'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({ 
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UnseenIndonesia - Temukan Sejarah Tersembunyi Indonesia',
  description: 'Jelajahi cerita-cerita sejarah yang belum pernah Anda dengar dari seluruh nusantara. Platform komunitas untuk berbagi dan menemukan warisan budaya Indonesia.',
  keywords: ['sejarah indonesia', 'budaya indonesia', 'cerita rakyat', 'heritage', 'nusantara'],
  authors: [{ name: 'UnseenIndonesia Team' }],
  creator: 'UnseenIndonesia',
  publisher: 'UnseenIndonesia',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://unseenindonesia.com',
    siteName: 'UnseenIndonesia',
    title: 'UnseenIndonesia - Temukan Sejarah Tersembunyi Indonesia',
    description: 'Jelajahi cerita-cerita sejarah yang belum pernah Anda dengar dari seluruh nusantara.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UnseenIndonesia - Discover Hidden Indonesian History',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UnseenIndonesia - Temukan Sejarah Tersembunyi Indonesia',
    description: 'Jelajahi cerita-cerita sejarah yang belum pernah Anda dengar dari seluruh nusantara.',
    images: ['/og-image.jpg'],
    creator: '@unseenindonesia',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${nunitoSans.variable} ${playfairDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}