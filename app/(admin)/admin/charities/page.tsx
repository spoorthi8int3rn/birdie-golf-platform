'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, Loader2, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Charity } from '@/types'

export default function AdminCharitiesPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Charity | null>(null)
  const [saving, setSaving] = useState(false)

  const empty = { name: '', short_description: '', description: '', image_url: '', website_url: '' }
  const [form, setForm] = useState(empty)

  async function fetchCharities() {
    const { data } = await supabase.from('charities').select('*').order('featured', { ascending: false }).order('name')
    setCharities(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCharities() }, [])

  function openCreate() { setEditing(null); setForm(empty); setShowForm(true) }
  function openEdit(c: Charity) {
    setEditing(c)
    setForm({ name: c.name, short_description: c.short_description, description: c.description, image_url: c.image_url || '', website_url: c.website_url || '' })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    if (editing) {
      await supabase.from('charities').update(form).eq('id', editing.id)
    } else {
      await supabase.from('charities').insert({ ...form, active: true, featured: false })
    }
    setShowForm(false)
    await fetchCharities()
    setSaving(false)
  }

  async function toggleFeatured(c: Charity) {
    await supabase.from('charities').update({ featured: !c.featured }).eq('id', c.id)
    await fetchCharities()
  }

  async function toggleActive(c: Charity) {
    await supabase.from('charities').update({ active: !c.active }).eq('id', c.id)
    await fetchCharities()
  }

  async function deleteCharity(id: string) {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    await fetchCharities()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70 font-body mb-1">Admin</p>
          <h1 className="font-display text-4xl">Charities</h1>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-card rounded-2xl border border-white/10 p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl">{editing ? 'Edit Charity' : 'Add Charity'}</h3>
              <button onClick={() => setShowForm(false)} className="text-ivory-dim hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Name', placeholder: 'Charity name' },
                { key: 'short_description', label: 'Short Description', placeholder: 'One-line description' },
                { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
                { key: 'website_url', label: 'Website URL', placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-ivory-dim font-body block mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-obsidian-muted border border-white/10 rounded-lg px-4 py-2.5 text-sm font-body text-ivory focus:outline-none focus:border-gold/40"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-widest text-ivory-dim font-body block mb-1">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-obsidian-muted border border-white/10 rounded-lg px-4 py-2.5 text-sm font-body text-ivory focus:outline-none focus:border-gold/40 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {charities.map(c => (
            <div key={c.id} className="glass-card rounded-xl border border-white/5 flex items-center gap-4 p-4">
              {c.image_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-obsidian-muted">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover opacity-70" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body font-medium text-ivory">{c.name}</p>
                  {c.featured && <span className="text-xs bg-gold/10 text-gold border border-gold/20 rounded-full px-2 font-body">Featured</span>}
                  {!c.active && <span className="text-xs bg-red-900/20 text-red-400 border border-red-800/20 rounded-full px-2 font-body">Inactive</span>}
                </div>
                <p className="text-xs text-ivory-dim font-body truncate">{c.short_description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleFeatured(c)} className={`p-2 transition-colors ${c.featured ? 'text-gold' : 'text-ivory-dim hover:text-gold'}`} title="Toggle featured">
                  <Star className="w-4 h-4" fill={c.featured ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => toggleActive(c)} className={`p-2 transition-colors text-xs font-body ${c.active ? 'text-sage' : 'text-ivory-dim'}`} title="Toggle active">
                  {c.active ? '✓' : '✗'}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 text-ivory-dim hover:text-ivory transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteCharity(c.id)} className="p-2 text-ivory-dim hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
