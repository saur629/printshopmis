'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard, Badge, Button, Modal, FormGroup, Input, Select, Textarea, Card, CardHeader, CardTitle, Loading, Empty } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const PO_STATUS_COLOR: Record<string, string> = { ORDERED: 'yellow', IN_TRANSIT: 'blue', RECEIVED: 'green', CANCELLED: 'red' }

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ supplierId: '', notes: '', items: [{ itemId: '', qty: '', rate: '' }] })

  useEffect(() => {
    Promise.all([
      fetch('/api/purchase').then(r => r.json()),
      fetch('/api/masters/suppliers').then(r => r.json()).catch(() => []),
    ]).then(([data, sups]) => {
      setPurchases(data.purchases || [])
      setItems(data.items || [])
      setSuppliers(Array.isArray(sups) ? sups : [])
      setLoading(false)
    })
  }, [])

  function addItem() { setForm(f => ({ ...f, items: [...f.items, { itemId: '', qty: '', rate: '' }] })) }
  function removeItem(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }
  function updateItem(i: number, field: string, val: string) {
    setForm(f => { const its = [...f.items]; its[i] = { ...its[i], [field]: val }; return { ...f, items: its } })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const po = await res.json()
      setPurchases(prev => [po, ...prev])
      setShowModal(false)
      setForm({ supplierId: '', notes: '', items: [{ itemId: '', qty: '', rate: '' }] })
      toast.success(`Purchase Order ${po.poNo} created!`)
    } catch { toast.error('Failed to create PO') }
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/purchase/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p)); toast.success('PO status updated') }
  }

  const totalSpend = purchases.reduce((s, p) => s + (p.totalAmount || 0), 0)
  const pending = purchases.filter(p => p.status === 'ORDERED').length

  return (
    <PageShell title="Purchase & Inventory" action={{ label: '+ New PO', onClick: () => setShowModal(true) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total POs" value={purchases.length} icon="🛒" color="blue" />
        <StatCard label="Total Spend" value={formatCurrency(totalSpend)} icon="💸" color="yellow" />
        <StatCard label="Pending Delivery" value={pending} icon="🚚" color="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* PO List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <Button variant="primary" onClick={() => setShowModal(true)}>+ New PO</Button>
          </CardHeader>
          {loading ? <Loading /> : purchases.length === 0 ? <Empty message="No purchase orders yet" /> : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>PO No.</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {purchases.map(po => (
                    <tr key={po.id}>
                      <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{po.poNo}</td>
                      <td style={{ fontWeight: 500 }}>{po.supplier?.name}</td>
                      <td style={{ color: '#10b981' }}>{formatCurrency(po.totalAmount)}</td>
                      <td><Badge color={PO_STATUS_COLOR[po.status]}>{po.status}</Badge></td>
                      <td>
                        <Select style={{ width: 120, padding: '2px 6px', fontSize: 10 }} value={po.status} onChange={e => updateStatus(po.id, e.target.value)}>
                          <option value="ORDERED">Ordered</option>
                          <option value="IN_TRANSIT">In Transit</option>
                          <option value="RECEIVED">Received</option>
                          <option value="CANCELLED">Cancelled</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader><CardTitle>Stock / Inventory</CardTitle></CardHeader>
          <div style={{ padding: 16 }}>
            {items.length === 0 ? <Empty message="No items in inventory" /> : items.map(item => {
              const pct = Math.min(100, Math.round((item.stock / Math.max(item.minStock * 3, 1)) * 100))
              const color = pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#10b981'
              return (
                <div key={item.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{item.name}</span>
                    <span style={{ color, fontWeight: 600 }}>{item.stock} {item.unit}</span>
                  </div>
                  <div style={{ height: 5, background: '#252d40', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                  {item.stock < item.minStock && (
                    <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>⚠ Low stock — reorder needed</div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* New PO Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Purchase Order"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : '💾 Save PO'}</Button>
        </>}>
        <form onSubmit={handleCreate}>
          <FormGroup label="Supplier *">
            <Select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FormGroup>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items *</label>
              <Button size="sm" type="button" onClick={addItem}>+ Add Item</Button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} style={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                  <Select value={item.itemId} onChange={e => updateItem(i, 'itemId', e.target.value)} required>
                    <option value="">Select Item</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                  </Select>
                  <Input type="number" step="0.01" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="Qty" required />
                  <Input type="number" step="0.01" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} placeholder="Rate ₹" required />
                  {form.items.length > 1 && (
                    <Button size="sm" type="button" variant="danger" onClick={() => removeItem(i)}>✕</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <FormGroup label="Notes">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Delivery instructions, terms..." />
          </FormGroup>
        </form>
      </Modal>
    </PageShell>
  )
}
