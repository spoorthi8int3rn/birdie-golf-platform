import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { formatDate, statusBadgeColor, getInitials } from '@/lib/utils'
import AdminUserActions from './actions'

export default async function AdminUsersPage() {
  const supabase = createAdminSupabaseClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*, subscriptions(status, plan, current_period_end), charities(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold/70 font-body mb-1">Admin</p>
        <h1 className="font-display text-4xl">Users <span className="text-gold/50">({users?.length || 0})</span></h1>
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Member</th>
              <th className="text-left">Subscription</th>
              <th className="text-left">Charity</th>
              <th className="text-left">Joined</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => {
              const sub = (user as any).subscriptions?.[0]
              return (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-display flex-shrink-0">
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <p className="text-sm text-ivory font-body">{user.full_name}</p>
                        <p className="text-xs text-ivory-dim font-body">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="text-xs bg-gold/10 text-gold border border-gold/20 rounded-full px-1.5 font-body">admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {sub ? (
                      <div>
                        <span className={`text-xs rounded-full px-2 py-0.5 border font-body ${statusBadgeColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        <p className="text-xs text-ivory-dim font-body mt-1">{sub.plan}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-ivory-dim font-body">No subscription</span>
                    )}
                  </td>
                  <td className="text-xs text-ivory-dim font-body">
                    {(user as any).charities?.name || '—'}
                  </td>
                  <td className="text-xs text-ivory-dim font-body">
                    {formatDate(user.created_at)}
                  </td>
                  <td>
                    <AdminUserActions userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
