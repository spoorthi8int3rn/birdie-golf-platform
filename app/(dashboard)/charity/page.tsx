'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Check, CheckCircle, ExternalLink, Heart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Surface } from '@/components/ui/layout'
import type { Charity, Profile } from '@/types'

export default function CharityPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState<Charity[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selected, setSelected] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: charitiesData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('charities').select('*').eq('active', true).order('featured', { ascending: false }),
      ])

      if (profileData) {
        setProfile(profileData as Profile)
        setSelected(profileData.charity_id || '')
        setPercentage(profileData.charity_percentage || 10)
      }
      setCharities(charitiesData || [])
      setLoading(false)
    }

    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase
      .from('profiles')
      .update({
        charity_id: selected,
        charity_percentage: percentage,
      })
      .eq('id', user!.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const selectedCharity = charities.find((charity) => charity.id === selected)
  const monthlyAmount = profile ? ((10 / 100) * percentage).toFixed(2) : '0.00'

  return (
    <div className="page-container">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Giving back</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">My charity</h1>
        </div>

        {selectedCharity && (
          <Surface className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Currently supporting</p>
              <h2 className="text-3xl font-bold text-white">{selectedCharity.name}</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">{selectedCharity.short_description}</p>
            </div>
            <div className="rounded-2xl bg-emerald-400/10 px-6 py-5 text-center">
              <p className="text-3xl font-bold text-emerald-300">{percentage}%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-emerald-200/80">GBP {monthlyAmount}/mo</p>
            </div>
          </Surface>
        )}

        <Surface className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-slate-200">Contribution percentage</label>
            <span className="text-2xl font-bold text-amber-300">{percentage}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Minimum 10%</span>
            <span>100% donation</span>
          </div>
        </Surface>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Choose a charity</h2>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {charities.map((charity) => (
                <motion.button
                  key={charity.id}
                  onClick={() => setSelected(charity.id)}
                  whileHover={{ y: -2 }}
                  className={`overflow-hidden rounded-3xl border text-left transition-all ${
                    selected === charity.id
                      ? 'border-emerald-400/40 shadow-[0_24px_80px_rgba(16,185,129,0.14)]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="relative h-44 bg-slate-900">
                    {charity.image_url && <Image src={charity.image_url} alt={charity.name} fill className="object-cover opacity-75" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      {charity.featured && (
                        <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                          Featured
                        </span>
                      )}
                    </div>
                    {selected === charity.id && (
                      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 bg-slate-950/70 p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">{charity.name}</h3>
                      <p className="text-sm leading-7 text-slate-300">{charity.short_description}</p>
                    </div>
                    {charity.website_url && (
                      <a
                        href={charity.website_url}
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                      >
                        Visit website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !selected} className="btn-gold w-full justify-center sm:w-auto">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                Save charity
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
