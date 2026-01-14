import './globals.css'
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto'
})

export const metadata = {
  title: 'MineralsCorp - Leading Sustainable Mining Solutions',
  description: 'Professional mineral extraction and processing company with 30+ years of experience. Sustainable mining practices, advanced technology, and environmental responsibility.',
  keywords: 'mining, minerals, extraction, processing, sustainable mining, precious metals, industrial minerals, rare earth elements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${roboto.variable}`}>{children}</body>
    </html>
  )
}