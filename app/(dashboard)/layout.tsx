'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crown, Heart, LayoutDashboard, LogOut, Menu, Target, Trophy, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scores', label: 'My Scores', icon: Target },
  { href: '/charity', label: 'My Charity', icon: Heart },
  { href: '/draws', label: 'Draws', icon: Trophy },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*, charities(name), subscriptions(status, plan, current_period_end)')
      .then(({ data }) => {
        if (data?.[0]) setProfile(data[0] as Profile)
      })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="font-display text-2xl font-bold text-gold">
          Birdie
        </Link>
        <p className="mt-2 text-sm text-slate-400">Modern draw management for players and causes.</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              pathname.startsWith('/admin')
                ? 'bg-white text-slate-950 shadow-md'
                : 'border border-amber-400/20 bg-amber-400/10 text-amber-200 hover:border-amber-400/35 hover:bg-amber-400/15'
            )}
          >
            <Crown className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950">
              {profile?.full_name ? getInitials(profile.full_name) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile?.full_name}</p>
              <p className="truncate text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-red-400/30 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#111827_100%)] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl lg:flex">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/70" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-slate-950/95 backdrop-blur-xl"
            >
              <Sidebar />
            </motion.aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="page-container flex items-center justify-between py-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden lg:block">
                <p className="text-sm text-slate-400">Member workspace</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 lg:hidden',
                  !mobileOpen && 'invisible'
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 py-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
