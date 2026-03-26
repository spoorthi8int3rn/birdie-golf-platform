'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, Loader2, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Surface } from '@/components/ui/layout'
import type { GolfScore } from '@/types'

export default function ScoresPage() {
  const supabase = createClient()
  const [scores, setScores] = useState<GolfScore[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchScores() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false })
    setScores(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchScores()
  }, [])

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    const score = parseInt(newScore)
    if (Number.isNaN(score) || score < 1 || score > 45) {
      showToast('error', 'Score must be between 1 and 45')
      return
    }

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('golf_scores').insert({
      user_id: user!.id,
      score,
      played_at: newDate,
    })

    if (error) {
      showToast('error', error.message)
    } else {
      showToast('success', 'Score added. Oldest score is removed automatically after five.')
      setNewScore('')
      await fetchScores()
    }
    setSaving(false)
  }

  async function deleteScore(id: string) {
    const { error } = await supabase.from('golf_scores').delete().eq('id', id)
    if (!error) {
      setScores((prev) => prev.filter((score) => score.id !== id))
      showToast('success', 'Score removed')
    }
  }

  const average = scores.length > 0 ? (scores.reduce((sum, score) => sum + score.score, 0) / scores.length).toFixed(1) : '--'

  return (
    <div className="page-container">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg ${
              toast.type === 'success'
                ? 'border border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
                : 'border border-red-400/30 bg-red-500/15 text-red-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">My scores</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Score tracker</h1>
        </div>

        <Surface className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
          <p className="text-sm leading-7 text-slate-300">
            Your latest five Stableford scores stay active in the monthly draw. Add a sixth round and the oldest score automatically rolls off.
          </p>
        </Surface>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Scores logged', value: scores.length },
            { label: 'Average', value: average },
            { label: 'Best score', value: scores.length ? Math.max(...scores.map((score) => score.score)) : '--' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-6 text-center text-slate-900 shadow-md">
              <p className="text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <Surface className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Log a score</h2>
            <p className="text-sm text-slate-300">Add your latest round and keep your draw entry current.</p>
          </div>

          <form onSubmit={addScore} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Stableford score</label>
              <input
                type="number"
                min={1}
                max={45}
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
                placeholder="e.g. 32"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Date played</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="btn-gold w-full justify-center md:w-auto">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add score
                  </>
                )}
              </button>
            </div>
          </form>
        </Surface>

        <Surface className="overflow-hidden p-0">
          <div className="border-b border-white/10 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Your scores <span className="text-amber-300">({scores.length}/5 active)</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          ) : scores.length === 0 ? (
            <div className="px-8 py-16 text-center text-sm text-slate-300">No scores yet. Add your first round above.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col gap-4 px-8 py-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-lg font-bold text-slate-950">
                      {score.score}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Stableford {score.score}</p>
                      <p className="text-xs text-slate-400">{formatDate(score.played_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    {index === 0 && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                        Latest
                      </span>
                    )}
                    <button
                      onClick={() => deleteScore(score.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:border-red-400/30 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  )
}
