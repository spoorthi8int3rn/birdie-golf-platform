'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDate, formatMonth, tierLabel, statusBadgeColor } from '@/lib/utils'
import type { Winner } from '@/types'

export default function AdminWinnersPage() {
  const supabase = createClient()
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  async function fetchWinners() {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(month)')
      .order('created_at', { ascending: false })
    setWinners(data as Winner[] || [])
    setLoading(false)
  }

  useEffect(() => { fetchWinners() }, [])

  async function updateStatus(id: string, status: string) {
    setActionId(id)
    const updates: Record<string, string> = { status }
    if (status === 'verified') updates.verified_at = new Date().toISOString()
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    await supabase.from('winners').update(updates).eq('id', id)
    await fetchWinners()
    setActionId(null)
  }

  const filtered = filter === 'all' ? winners : winners.filter(w => w.status === filter)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70 font-body mb-1">Admin</p>
          <h1 className="font-display text-4xl">Winners</h1>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-body transition-all capitalize ${
                filter === f ? 'border-gold/40 text-gold bg-gold/10' : 'border-white/10 text-ivory-dim hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Winner</th>
                <th className="text-left">Draw</th>
                <th className="text-left">Tier</th>
                <th className="text-left">Prize</th>
                <th className="text-left">Status</th>
                <th className="text-left">Proof</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(winner => (
                <tr key={winner.id}>
                  <td>
                    <p className="text-sm text-ivory">{(winner as any).profiles?.full_name}</p>
                    <p className="text-xs text-ivory-dim">{(winner as any).profiles?.email}</p>
                  </td>
                  <td className="text-xs text-ivory-dim">{formatMonth((winner as any).draws?.month)}</td>
                  <td className="text-sm">{tierLabel(winner.tier)}</td>
                  <td className="font-display text-gold">£{winner.prize_amount.toFixed(2)}</td>
                  <td>
                    <span className={`text-xs rounded-full px-2 py-0.5 border font-body ${statusBadgeColor(winner.status)}`}>
                      {winner.status}
                    </span>
                  </td>
                  <td>
                    {winner.proof_url ? (
                      <a href={winner.proof_url} target="_blank" rel="noopener" className="text-xs text-gold hover:text-gold-light flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-ivory-dim/40 font-body">None</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {actionId === winner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-ivory-dim" />
                      ) : (
                        <>
                          {winner.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(winner.id, 'verified')}
                                className="p-1 hover:text-sage text-ivory-dim transition-colors"
                                title="Verify"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(winner.id, 'rejected')}
                                className="p-1 hover:text-red-400 text-ivory-dim transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {winner.status === 'verified' && (
                            <button
                              onClick={() => updateStatus(winner.id, 'paid')}
                              className="text-xs btn-gold py-1 px-3"
                            >
                              Mark Paid
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ivory-dim py-8 font-body text-sm">
                    No {filter === 'all' ? '' : filter} winners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
