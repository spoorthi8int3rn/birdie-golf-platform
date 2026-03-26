import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export default async function AdminPage() {
  const supabase = createAdminSupabaseClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: pools },
    { data: contributions },
    { count: pendingWinners },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('pool_total, five_match_pool, four_match_pool, three_match_pool'),
    supabase.from('charity_contributions').select('amount'),
    supabase.from('winners').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const totalPool = pools?.reduce((s, d) => s + (d.pool_total || 0), 0) || 0
  const totalCharity = contributions?.reduce((s, c) => s + (c.amount || 0), 0) || 0

  const stats = [
    { label: 'Total Members', value: totalUsers ?? 0, color: 'text-gold' },
    { label: 'Active Subscribers', value: activeSubscribers ?? 0, color: 'text-sage' },
    { label: 'Total Prize Pools', value: `£${totalPool.toFixed(0)}`, color: 'text-gold' },
    { label: 'Charity Raised', value: `£${totalCharity.toFixed(0)}`, color: 'text-sage' },
    { label: 'Pending Winners', value: pendingWinners ?? 0, color: pendingWinners ? 'text-yellow-400' : 'text-ivory-dim' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold/70 font-body mb-1">Admin Panel</p>
        <h1 className="font-display text-4xl">Overview</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-white/5 text-center">
            <p className={`font-display text-3xl ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest text-ivory-dim font-body">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display text-xl">Recent Signups</h3>
          <a href="/admin/users" className="text-xs text-gold font-body hover:text-gold-light">View all →</a>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers?.map(u => (
              <tr key={u.id}>
                <td className="text-ivory">{u.full_name}</td>
                <td className="text-ivory-dim">{u.email}</td>
                <td>
                  <span className={`text-xs rounded-full px-2 py-0.5 border font-body ${u.role === 'admin' ? 'bg-gold/20 text-gold border-gold/30' : 'bg-white/5 text-ivory-dim border-white/10'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="text-ivory-dim">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
