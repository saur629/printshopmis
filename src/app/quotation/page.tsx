'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard, Badge, Button, Modal, FormGroup, Input, Select, Textarea, Card, CardHeader, CardTitle, Loading, Empty } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red', CONVERTED: 'blue' }

export default function QuotationPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ clientId: '', description: '', qty: '', rate: '', gstPct: '18', validTill: '', notes: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/quotations').then(r => r.json()),
      fetch('/api/masters/clients').then(r => r.json()),
    ]).then(([qts, cls]) => { setQuotations(qts); setClients(cls); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const qt = await res.json()
      setQuotations(prev => [qt, ...prev])
      setShowModal(false)
      setForm({ clientId: '', description: '', qty: '', rate: '', gstPct: '18', validTill: '', notes: '' })
      toast.success(`Quotation ${qt.qtNo} created!`)
    } catch { toast.error('Failed to create quotation') }
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/quotations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q)); toast.success('Status updated') }
  }

  const amt = (parseFloat(form.rate) || 0) * (parseInt(form.qty) || 0)
  const gst = amt * (parseFloat(form.gstPct) || 18) / 100

  const counts = { total: quotations.length, pending: quotations.filter(q => q.status === 'PENDING').length, approved: quotations.filter(q => q.status === 'APPROVED').length, rejected: quotations.filter(q => q.status === 'REJECTED').length }

  return (
    <PageShell title="Quotations" action={{ label: '+ New Quotation', onClick: () => setShowModal(true) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total This Month" value={counts.total} icon="📝" color="blue" />
        <StatCard label="Approved" value={counts.approved} icon="✅" color="green" />
        <StatCard label="Pending" value={counts.pending} icon="⏳" color="yellow" />
        <StatCard label="Rejected" value={counts.rejected} icon="❌" color="red" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation List</CardTitle>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ New Quotation</Button>
        </CardHeader>
        {loading ? <Loading /> : quotations.length === 0 ? <Empty message="No quotations yet" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>QT No.</th><th>Date</th><th>Client</th><th>Description</th><th>Qty</th><th>Total</th><th>Valid Till</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {quotations.map(qt => (
                  <tr key={qt.id}>
                    <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{qt.qtNo}</td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{formatDate(qt.date)}</td>
                    <td style={{ fontWeight: 500 }}>{qt.client?.name}</td>
                    <td style={{ color: '#8892a4', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qt.description}</td>
                    <td>{qt.qty?.toLocaleString()}</td>
                    <td style={{ color: '#10b981', fontWeight: 500 }}>{formatCurrency(qt.totalAmount)}</td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{formatDate(qt.validTill)}</td>
                    <td><Badge color={STATUS_COLORS[qt.status]}>{qt.status}</Badge></td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      {qt.status === 'PENDING' && <>
                        <Button size="sm" onClick={() => updateStatus(qt.id, 'APPROVED')}>✓ Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => updateStatus(qt.id, 'REJECTED')}>✗</Button>
                      </>}
                      {qt.status === 'APPROVED' && <Button size="sm" onClick={() => updateStatus(qt.id, 'CONVERTED')}>→ Convert</Button>}
                      {qt.status === 'REJECTED' && <Button size="sm" onClick={() => updateStatus(qt.id, 'PENDING')}>Revise</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Quotation"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : '💾 Save & Send'}</Button>
        </>}>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Client *">
              <Select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Valid Till *">
              <Input type="date" value={form.validTill} onChange={e => setForm(f => ({ ...f, validTill: e.target.value }))} required />
            </FormGroup>
          </div>
          <FormGroup label="Description *">
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Brochure 2000 Pcs, 4-color, Matt Lam" required />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormGroup label="Quantity *">
              <Input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="0" required />
            </FormGroup>
            <FormGroup label="Unit Rate (₹) *">
              <Input type="number" step="0.01" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="0.00" required />
            </FormGroup>
            <FormGroup label="GST %">
              <Select value={form.gstPct} onChange={e => setForm(f => ({ ...f, gstPct: e.target.value }))}>
                <option value="18">18%</option><option value="12">12%</option><option value="5">5%</option><option value="0">Exempt</option>
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Notes">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Terms, delivery details..." />
          </FormGroup>
          <div style={{ background: '#1e2535', borderRadius: 8, padding: '12px 14px', border: '1px solid #2a3348' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#8892a4' }}>Subtotal</span><span>{formatCurrency(amt)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span style={{ color: '#8892a4' }}>GST {form.gstPct}%</span><span>{formatCurrency(gst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#3b82f6', paddingTop: 6, borderTop: '1px solid #2a3348' }}><span>Total</span><span>{formatCurrency(amt + gst)}</span></div>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}
