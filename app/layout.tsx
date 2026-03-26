import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Birdie - Golf with Purpose',
  description: 'Play golf. Win prizes. Fund causes that matter.',
  keywords: ['golf', 'charity', 'subscription', 'prize draw', 'stableford'],
  other: {
    'format-detection': 'telephone=no, date=no, email=no, address=no',
  },
  openGraph: {
    title: 'Birdie - Golf with Purpose',
    description: 'Play golf. Win prizes. Fund causes that matter.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${cormorant.variable}`}>
      <body suppressHydrationWarning className="font-body bg-obsidian text-ivory antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
