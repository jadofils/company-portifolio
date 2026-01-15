import './globals.css'

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
      <body className="font-sans">{children}</body>
    </html>
  )
}