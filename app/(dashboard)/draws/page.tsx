'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Lock, Trophy, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn, formatMonth, statusBadgeColor, tierLabel } from '@/lib/utils'
import { Surface } from '@/components/ui/layout'
import type { Draw, DrawEntry, Winner } from '@/types'

function DrawBall({ number, matched }: { number: number; matched: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold',
        matched
          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
          : 'border border-white/10 bg-white/[0.04] text-slate-300'
      )}
    >
      {number}
    </motion.div>
  )
}

export default function DrawsPage() {
  const supabase = createClient()
  const [draws, setDraws] = useState<Draw[]>([])
  const [myEntries, setMyEntries] = useState<Record<string, DrawEntry>>({})
  const [myWinnings, setMyWinnings] = useState<Record<string, Winner>>({})
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const [{ data: drawData }, { data: entryData }, { data: winData }] = await Promise.all([
        supabase.from('draws').select('*').eq('status', 'published').order('month', { ascending: false }),
        supabase.from('draw_entries').select('*').eq('user_id', user.id),
        supabase.from('winners').select('*').eq('user_id', user.id),
      ])

      setDraws(drawData || [])

      const entriesMap: Record<string, DrawEntry> = {}
      entryData?.forEach((entry) => {
        entriesMap[entry.draw_id] = entry
      })
      setMyEntries(entriesMap)

      const winsMap: Record<string, Winner> = {}
      winData?.forEach((winner) => {
        winsMap[winner.draw_id] = winner
      })
      setMyWinnings(winsMap)
      setLoading(false)
    }

    load()
  }, [])

  async function uploadProof(winnerId: string, file: File) {
    setUploading(winnerId)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${winnerId}.${ext}`
    const { data: uploadData } = await supabase.storage.from('winner-proofs').upload(path, file, { upsert: true })
    if (uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('winner-proofs').getPublicUrl(path)
      await supabase.from('winners').update({ proof_url: publicUrl }).eq('id', winnerId)
    }
    setUploading(null)
  }

  if (loading) {
    return (
      <div className="page-container flex h-64 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">Monthly draws</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Draw results</h1>
        </div>

        {draws.length === 0 ? (
          <Surface className="py-16 text-center">
            <Trophy className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-4 text-sm text-slate-300">No draws published yet.</p>
            <p className="mt-2 text-xs text-slate-500">Check back at the end of the month.</p>
          </Surface>
        ) : (
          <div className="space-y-6">
            {draws.map((draw, index) => {
              const myEntry = myEntries[draw.id]
              const myWin = myWinnings[draw.id]

              return (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Surface className={cn('space-y-6', myWin && 'border-amber-400/25')}>
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{draw.draw_type} draw</p>
                        <h2 className="text-3xl font-bold text-white">{formatMonth(draw.month)}</h2>
                      </div>
                      <div className="rounded-2xl bg-amber-400/10 px-5 py-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">Prize pool</p>
                        <p className="mt-1 text-2xl font-bold text-amber-300">GBP {draw.pool_total.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Winning numbers</p>
                      <div className="flex flex-wrap gap-3">
                        {draw.winning_numbers?.map((number) => (
                          <DrawBall key={number} number={number} matched={myEntry?.numbers?.includes(number) ?? false} />
                        ))}
                      </div>
                    </div>

                    {myEntry ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">My numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {myEntry.numbers.map((number) => (
                            <span
                              key={number}
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold',
                                draw.winning_numbers?.includes(number)
                                  ? 'border border-amber-400/30 bg-amber-400/10 text-amber-200'
                                  : 'border border-white/10 bg-white/[0.03] text-slate-300'
                              )}
                            >
                              {number}
                            </span>
                          ))}
                          {myEntry.matched_count > 0 && (
                            <span className="self-center pl-2 text-sm font-semibold text-amber-300">
                              {myEntry.matched_count} match{myEntry.matched_count !== 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                        <Lock className="h-4 w-4 text-slate-400" />
                        You were not entered in this draw.
                      </div>
                    )}

                    {myWin && (
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-300" />
                              <span className="text-sm font-semibold text-amber-200">{tierLabel(myWin.tier)} winner</span>
                            </div>
                            <p className="text-3xl font-bold text-white">GBP {myWin.prize_amount.toFixed(2)}</p>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeColor(myWin.status)}`}>
                              {myWin.status}
                            </span>
                          </div>

                          {myWin.status === 'pending' && !myWin.proof_url && (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-300">Upload proof of scores</p>
                              <label className="btn-gold cursor-pointer px-4 py-2 text-sm">
                                {uploading === myWin.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) uploadProof(myWin.id, e.target.files[0])
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          {myWin.proof_url && myWin.status === 'pending' && (
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                              Proof submitted and awaiting review
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {[
                        { label: '5 match', amount: draw.five_match_pool },
                        { label: '4 match', amount: draw.four_match_pool },
                        { label: '3 match', amount: draw.three_match_pool },
                      ].map((pool) => (
                        <div key={pool.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{pool.label}</p>
                          <p className="mt-2 text-xl font-bold text-amber-300">GBP {pool.amount.toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  </Surface>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
