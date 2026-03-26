'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Heart } from 'lucide-react'
import { Container, Section, Surface } from '@/components/ui/layout'

function Counter({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

const stats = [
  { label: 'Raised for Charity', value: 142000, prefix: 'GBP ', suffix: '+' },
  { label: 'Active Members', value: 2840, suffix: '+' },
  { label: 'Monthly Pool', value: 14000, prefix: 'GBP ', suffix: '+' },
]

const steps = [
  {
    number: '01',
    title: 'Subscribe and play',
    description: 'Choose a monthly or annual plan, then log every Stableford round you complete.',
  },
  {
    number: '02',
    title: 'Enter the monthly draw',
    description: 'Your latest five scores become your entry numbers for each month’s prize pool.',
  },
  {
    number: '03',
    title: 'Direct real impact',
    description: 'At least 10% of every subscription goes to the charity you choose inside your account.',
  },
]

const prizeTiers = [
  { tier: '5 numbers', pool: '40%', description: 'Jackpot tier with rollover if unclaimed.' },
  { tier: '4 numbers', pool: '35%', description: 'Split equally between all verified winners.' },
  { tier: '3 numbers', pool: '25%', description: 'Broad winner tier to keep every month active.' },
]

const plans = [
  {
    name: 'Monthly',
    price: 'GBP 10',
    period: '/month',
    features: ['5 scores in play', 'Monthly draw entry', '10%+ to charity', 'Impact dashboard'],
    href: '/signup?plan=monthly',
    cta: 'Start monthly',
  },
  {
    name: 'Annual',
    price: 'GBP 96',
    period: '/year',
    badge: 'Save 20%',
    features: ['Everything in Monthly', 'Priority draw entry', 'Featured charity voting', 'Annual impact report'],
    href: '/signup?plan=yearly',
    cta: 'Start annual',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] text-ivory">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <Container className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-2xl font-bold text-gold">
              Birdie
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/charities" className="nav-link">
                Charities
              </Link>
              <Link href="/draws" className="nav-link">
                Draws
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost hidden md:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="btn-gold">
              Start Playing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </header>

      <Section className="py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  <Heart className="h-3.5 w-3.5" />
                  Golf with purpose
                </span>
              </motion.div>
              <motion.div variants={fadeUp} className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-6xl">
                  Play. Win. Give.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                  Birdie turns every round into a monthly draw entry and sends part of every subscription to the charity you choose.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/signup" className="btn-gold w-full sm:w-auto">
                  Join Birdie
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/draws" className="btn-ghost w-full sm:w-auto">
                  View latest draw
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Surface className="space-y-6 border-amber-400/15 bg-slate-900/70">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                    Example draw
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    Startup-simple mechanics.
                  </h2>
                  <p className="text-sm leading-7 text-slate-300">
                    Log your latest five Stableford scores. Match three, four, or all five numbers in the draw and claim your share of the monthly pool.
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[7, 14, 22, 31, 38].map((number) => (
                    <div
                      key={number}
                      className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/20"
                    >
                      {number}
                    </div>
                  ))}
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Monthly charity contribution</span>
                    <span className="font-semibold text-white">10% minimum</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Typical winner cadence</span>
                    <span className="font-semibold text-white">Every month</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Pool visibility</span>
                    <span className="font-semibold text-white">Live in dashboard</span>
                  </div>
                </div>
              </Surface>
            </motion.div>
          </div>

          <div className="mt-12 flex justify-center">
            <ChevronDown className="h-5 w-5 animate-bounce text-amber-200/60" />
          </div>
        </Container>
      </Section>

      <Section className="border-t border-white/10">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-6 text-center text-slate-900 shadow-md">
                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  <Counter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="space-y-10">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">How it works</p>
            <h2 className="section-heading max-w-3xl text-white">A cleaner flow for a modern golf membership.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Surface key={step.number} className="space-y-4">
                <p className="text-4xl font-bold tracking-tight text-amber-300/60">{step.number}</p>
                <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-7 text-slate-300">{step.description}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-white/10">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">Prize structure</p>
              <h2 className="section-heading text-white">Transparent rules, visible upside.</h2>
              <p className="max-w-xl text-base leading-8 text-slate-300">
                Members can understand the model at a glance. The pool is split clearly, winners submit proof, and every draw result stays visible.
              </p>
            </div>
            <div className="space-y-4">
              {prizeTiers.map((tier) => (
                <Surface key={tier.tier} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{tier.tier}</p>
                    <p className="text-sm leading-7 text-slate-300">{tier.description}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 px-4 py-3 text-center sm:min-w-[110px]">
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-200/80">Pool</p>
                    <p className="text-2xl font-bold text-amber-300">{tier.pool}</p>
                  </div>
                </Surface>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-white/10">
        <Container className="space-y-10">
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">Plans</p>
            <h2 className="section-heading text-white">Simple pricing for a sharper MVP.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-8 shadow-xl ${
                  index === 1
                    ? 'border-amber-400/40 bg-gradient-to-br from-amber-400/10 to-slate-900/80'
                    : 'border-white/10 bg-slate-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-5xl font-bold tracking-tight text-amber-300">{plan.price}</span>
                      <span className="pb-1 text-sm text-slate-300">{plan.period}</span>
                    </div>
                  </div>
                  {plan.badge && (
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="btn-gold mt-8 w-full">
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <footer className="border-t border-white/10 py-10">
        <Container className="flex flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-gold">Birdie</p>
            <p className="mt-1">Golf with purpose.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/charities" className="hover:text-white">
              Charities
            </Link>
            <Link href="/draws" className="hover:text-white">
              Draws
            </Link>
            <Link href="/login" className="hover:text-white">
              Sign in
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Birdie. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  )
}
