import type { Metadata } from 'next'
import { Rubik, Poppins, Open_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const rubik = Rubik({ 
  subsets: ["latin"],
  variable: '--font-rubik',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const openSans = Open_Sans({ 
  subsets: ["latin"],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'cadastra.ai',
  description: 'Sistema de cadastro e gestão para clínicas e consultórios',
  icons: {
    icon: 'https://i.postimg.cc/Y25qLcjD/Cadastra-%281%29.png',
    shortcut: 'https://i.postimg.cc/Y25qLcjD/Cadastra-%281%29.png',
    apple: 'https://i.postimg.cc/Y25qLcjD/Cadastra-%281%29.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${rubik.variable} ${poppins.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
