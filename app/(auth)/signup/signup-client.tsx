'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Charity } from '@/types'

// Stable client — created once, not on every re-render
const supabase = createClient()

export default function SignupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [status, setStatus] = useState('')
  const [charities, setCharities] = useState<Charity[]>([])
  const [charitiesLoading, setCharitiesLoading] = useState(true)
  const [charitiesError, setCharitiesError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedCharity, setSelectedCharity] = useState('')
  const [charityPct, setCharityPct] = useState(10)

  useEffect(() => {
    const urlPlan = searchParams.get('plan')
    if (urlPlan === 'monthly' || urlPlan === 'yearly') {
      setPlan(urlPlan)
    }
  }, [searchParams])

  useEffect(() => {
    async function loadCharities() {
      const { data, error } = await supabase.from('charities').select('*').eq('active', true)

      if (error) {
        console.error('[Signup] Failed to load charities:', error)
        setCharitiesError(error.message)
        setCharitiesLoading(false)
        return
      }

      if (data) {
        setCharities(data)
        if (data.length > 0) {
          setSelectedCharity((current) => current || data[0].id)
        } else {
          setCharitiesError('No charities are available yet. Add one in Supabase before signup can complete.')
        }
      }

      setCharitiesLoading(false)
    }

    loadCharities()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignup() {
    if (!selectedCharity) {
      setError('Select a charity before continuing.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setStatus('Creating your account...')

    try {
      // Server-side user creation (trigger is dropped, admin API used)
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email,
          password,
          fullName,
          charityId: selectedCharity,
          charityPercentage: charityPct,
        }),
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload.error || 'Could not create your account.')
      }

      // Sign in client-side to set session cookies
      setStatus('Signing you in...')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[Signup] Sign-in after creation failed:', signInError)
        setSuccess('Account created! Please sign in with your credentials.')
        setLoading(false)
        setStatus('')
        return
      }

      // Redirect to dashboard
      window.location.assign(payload.url || '/dashboard?success=true')
    } catch (err: any) {
      console.error('[Signup] handleSignup error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setStatus('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_25%),linear-gradient(180deg,#020617_0%,#111827_100%)] px-6 py-16">
      <div className="mx-auto mt-20 w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <Link href="/" className="font-display text-3xl font-bold text-gold">
              Birdie
            </Link>
            <p className="mt-3 text-sm text-slate-300">Create your account and set up your first plan in minutes.</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((current) => (
              <div key={current} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    step > current
                      ? 'bg-amber-400 text-slate-950'
                      : step === current
                        ? 'border border-amber-300 text-amber-200'
                        : 'border border-white/15 text-slate-400'
                  }`}
                >
                  {step > current ? <Check className="h-4 w-4" /> : current}
                </div>
                {current < 3 && <div className={`h-px w-10 ${step > current ? 'bg-amber-300' : 'bg-white/15'}`} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-8 text-slate-900 shadow-xl shadow-slate-950/30">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">Account details</h2>
                    <p className="text-sm text-slate-500">Start with the basics for your Birdie profile.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Full name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="input-field pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !email || password.length < 8) {
                        setError('Please fill every field. Password must be at least 8 characters.')
                        return
                      }
                      setError('')
                      setStep(2)
                    }}
                    className="btn-gold w-full justify-center"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">Choose your plan</h2>
                    <p className="text-sm text-slate-500">Pick the subscription that fits how often you play.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'monthly',
                        name: 'Monthly',
                        price: 'GBP 10/mo',
                        description: 'Flexible access with monthly draw entry.',
                      },
                      {
                        id: 'yearly',
                        name: 'Annual',
                        price: 'GBP 96/yr',
                        description: 'Save 20% and keep your membership locked in.',
                        badge: 'Popular',
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPlan(option.id as 'monthly' | 'yearly')}
                        className={`w-full rounded-2xl border p-5 text-left transition-all ${
                          plan === option.id
                            ? 'border-amber-400 bg-amber-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-slate-950">{option.name}</span>
                              {option.badge && (
                                <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{option.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-950">{option.price}</p>
                            <div
                              className={`ml-auto mt-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                                plan === option.id ? 'border-amber-500 bg-amber-400' : 'border-slate-300'
                              }`}
                            >
                              {plan === option.id && <Check className="h-3 w-3 text-slate-950" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-900">
                      Back
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="btn-gold flex-1 justify-center">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">Choose a charity</h2>
                    <p className="text-sm text-slate-500">At least 10% of your subscription goes directly to this cause.</p>
                  </div>

                  {charitiesLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Loading charities...
                    </div>
                  ) : charitiesError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      {charitiesError}
                    </div>
                  ) : (
                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                      {charities.map((charity) => (
                        <button
                          key={charity.id}
                          type="button"
                          onClick={() => setSelectedCharity(charity.id)}
                          className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                            selectedCharity === charity.id
                              ? 'border-emerald-500 bg-emerald-50 shadow-md'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-950">{charity.name}</p>
                              <p className="text-sm text-slate-500">{charity.short_description}</p>
                            </div>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                selectedCharity === charity.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                              }`}
                            >
                              {selectedCharity === charity.id && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Contribution percentage</label>
                      <span className="text-lg font-bold text-amber-600">{charityPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={charityPct}
                      onChange={(e) => setCharityPct(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>10% minimum</span>
                      <span>100% maximum</span>
                    </div>
                  </div>

                  {!selectedCharity && !charitiesLoading && !charitiesError && (
                    <p className="text-sm text-amber-700">Select a charity to enable Pay and Join.</p>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {success && <p className="text-sm text-emerald-600">{success}</p>}
                  {status && <p className="text-sm text-slate-600">{status}</p>}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 justify-center border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-900">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={loading || charitiesLoading || !!charitiesError || !selectedCharity}
                      className="btn-gold flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Pay and Join
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
          </div>

          <p className="text-center text-sm text-slate-300">
            Already a member?{' '}
            <Link href="/login" className="font-semibold text-amber-300 transition-colors hover:text-amber-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
