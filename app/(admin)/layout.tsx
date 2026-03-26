'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Trophy, Heart, Award, BarChart3, Crown, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draws', icon: Trophy },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Award },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-obsidian flex">
      <aside className="w-56 flex-shrink-0 bg-obsidian-soft border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-2xl text-gold block mb-1">Birdie</Link>
          <div className="flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-gold/60" />
            <span className="text-xs text-gold/60 font-body uppercase tracking-widest">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/admin'
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-all',
                  isActive
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-ivory-dim hover:text-ivory hover:bg-white/[0.04]'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-ivory-dim hover:text-ivory font-body transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
