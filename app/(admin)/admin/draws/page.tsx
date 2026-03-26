'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Eye, Send, Plus, Loader2, RefreshCw, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatMonth, statusBadgeColor } from '@/lib/utils'
import type { Draw } from '@/types'

export default function AdminDrawsPage() {
  const supabase = createClient()
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [simResult, setSimResult] = useState<{ drawId: string; numbers: number[] } | null>(null)

  async function fetchDraws() {
    const { data } = await supabase.from('draws').select('*').order('month', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDraws() }, [])

  async function createDraw() {
    setActionLoading('create')
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { error } = await supabase.from('draws').insert({
      month,
      status: 'draft',
      draw_type: 'random',
      pool_total: 0,
      jackpot_carried_forward: 0,
    })
    if (!error) await fetchDraws()
    setActionLoading(null)
  }

  async function simulate(drawId: string, drawType: string) {
    setActionLoading(`sim-${drawId}`)
    const res = await fetch('/api/draws/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId, drawType }),
    })
    const data = await res.json()
    if (data.numbers) {
      setSimResult({ drawId, numbers: data.numbers })
      await fetchDraws()
    }
    setActionLoading(null)
  }

  async function publish(drawId: string) {
    setActionLoading(`pub-${drawId}`)
    const res = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId }),
    })
    const data = await res.json()
    if (data.success) await fetchDraws()
    setActionLoading(null)
  }

  async function toggleDrawType(draw: Draw) {
    const newType = draw.draw_type === 'random' ? 'algorithmic' : 'random'
    await supabase.from('draws').update({ draw_type: newType }).eq('id', draw.id)
    await fetchDraws()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70 font-body mb-1">Admin</p>
          <h1 className="font-display text-4xl">Draws</h1>
        </div>
        <button
          onClick={createDraw}
          disabled={actionLoading === 'create'}
          className="btn-gold"
        >
          {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> New Draw</>}
        </button>
      </div>

      {/* How draw types work */}
      <div className="glass-card rounded-xl p-4 border border-white/5 mb-6 grid md:grid-cols-2 gap-4">
        {[
          { type: 'Random', desc: 'Standard lottery — 5 unique numbers from 1–45, equal probability for all.' },
          { type: 'Algorithmic', desc: 'Weighted draw — least common player scores have higher draw probability. Harder to win, bigger excitement.' },
        ].map(t => (
          <div key={t.type}>
            <p className="text-xs font-body text-gold uppercase tracking-widest mb-1">{t.type}</p>
            <p className="text-xs text-ivory-dim font-body">{t.desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : draws.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-white/5">
          <p className="text-ivory-dim font-body">No draws yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div key={draw.id} className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div>
                  <h3 className="font-display text-xl">{formatMonth(draw.month)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs rounded-full px-2 py-0.5 border font-body ${statusBadgeColor(draw.status)}`}>
                      {draw.status}
                    </span>
                    <span className="text-xs text-ivory-dim font-body">{draw.total_entries} entries</span>
                    <span className="text-xs text-ivory-dim font-body">£{draw.pool_total.toFixed(0)} pool</span>
                  </div>
                </div>

                {draw.status !== 'published' && (
                  <div className="flex items-center gap-2">
                    {/* Toggle draw type */}
                    <button
                      onClick={() => toggleDrawType(draw)}
                      className="text-xs btn-ghost py-1.5 px-3"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {draw.draw_type}
                    </button>

                    {/* Simulate */}
                    {draw.status === 'draft' && (
                      <button
                        onClick={() => simulate(draw.id, draw.draw_type)}
                        disabled={!!actionLoading}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        {actionLoading === `sim-${draw.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Eye className="w-3.5 h-3.5" /> Simulate</>}
                      </button>
                    )}

                    {/* Publish */}
                    {(draw.status === 'draft' || draw.status === 'simulated') && (
                      <button
                        onClick={() => publish(draw.id)}
                        disabled={!!actionLoading}
                        className="btn-gold text-xs py-1.5 px-4"
                      >
                        {actionLoading === `pub-${draw.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Publish</>}
                      </button>
                    )}
                  </div>
                )}

                {draw.status === 'published' && (
                  <CheckCircle className="w-5 h-5 text-sage" />
                )}
              </div>

              {/* Winning numbers */}
              {(draw.winning_numbers || draw.simulation_numbers) && (
                <div className="px-6 py-4">
                  <p className="text-xs uppercase tracking-widest text-ivory-dim font-body mb-3">
                    {draw.status === 'simulated' ? 'Simulated Numbers (not published)' : 'Winning Numbers'}
                  </p>
                  <div className="flex gap-2">
                    {(draw.winning_numbers || draw.simulation_numbers)?.map(num => (
                      <div key={num} className="draw-ball-sm">{num}</div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: '5 Match (Jackpot)', value: draw.five_match_pool },
                      { label: '4 Match', value: draw.four_match_pool },
                      { label: '3 Match', value: draw.three_match_pool },
                    ].map(p => (
                      <div key={p.label} className="bg-obsidian-muted rounded-lg p-3">
                        <p className="text-xs text-ivory-dim font-body">{p.label}</p>
                        <p className="font-display text-gold">£{p.value?.toFixed(0) || '0'}</p>
                      </div>
                    ))}
                  </div>
                  {draw.jackpot_carried_forward > 0 && (
                    <p className="text-xs text-gold font-body mt-2">
                      🏆 Jackpot rollover: £{draw.jackpot_carried_forward.toFixed(0)} carried forward
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
