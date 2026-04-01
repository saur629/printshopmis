'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, Button, Modal, FormGroup, Input, Select, Card, CardHeader, CardTitle, Loading, Empty } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const TABS = ['Clients', 'Suppliers', 'Job Types', 'Items / GST']

export default function MastersPage() {
  const [tab, setTab] = useState('Clients')
  const [clients, setClients] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [jobTypes, setJobTypes] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Forms
  const [clientForm, setClientForm] = useState({ name: '', contact: '', email: '', city: '', gstNo: '', creditLimit: '' })
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', email: '', gstNo: '', items: '' })
  const [itemForm, setItemForm] = useState({ hsnCode: '', name: '', unit: 'KG', gstPct: '18', saleRate: '', stock: '', minStock: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/masters/clients').then(r => r.json()),
      fetch('/api/masters/suppliers').then(r => r.json()).catch(() => []),
    ]).then(([cls, sups]) => { setClients(cls); setSuppliers(Array.isArray(sups) ? sups : []); setLoading(false) })
  }, [])

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/masters/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clientForm) })
      if (!res.ok) throw new Error()
      const c = await res.json()
      setClients(prev => [...prev, c])
      setShowModal(false)
      setClientForm({ name: '', contact: '', email: '', city: '', gstNo: '', creditLimit: '' })
      toast.success('Client added!')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  async function saveSupplier(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/masters/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supplierForm) })
      if (!res.ok) throw new Error()
      const s = await res.json()
      setSuppliers(prev => [...prev, s])
      setShowModal(false)
      setSupplierForm({ name: '', contact: '', email: '', gstNo: '', items: '' })
      toast.success('Supplier added!')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  return (
    <PageShell title="Masters" action={{ label: `+ Add ${tab.replace(' / GST', '')}`, onClick: () => setShowModal(true) }}>
      <div style={{ display: 'flex', gap: 2, padding: 3, background: '#1e2535', borderRadius: 8, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '5px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: tab === t ? '#161b27' : 'transparent', color: tab === t ? '#e2e8f0' : '#8892a4' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <>
          {tab === 'Clients' && (
            <Card className="animate-in">
              <CardHeader><CardTitle>Client Master ({clients.length})</CardTitle><Button variant="primary" onClick={() => setShowModal(true)}>+ Add Client</Button></CardHeader>
              {clients.length === 0 ? <Empty message="No clients added yet" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>Code</th><th>Name</th><th>Contact</th><th>City</th><th>GST No.</th><th>Credit Limit</th><th>Status</th></tr></thead>
                    <tbody>
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{c.code}</td>
                          <td style={{ fontWeight: 500 }}>{c.name}</td>
                          <td style={{ color: '#8892a4' }}>{c.contact}</td>
                          <td style={{ color: '#8892a4' }}>{c.city || '—'}</td>
                          <td style={{ color: '#8892a4', fontSize: 11 }}>{c.gstNo || '—'}</td>
                          <td style={{ color: '#10b981' }}>{c.creditLimit ? formatCurrency(c.creditLimit) : '—'}</td>
                          <td><Badge color={c.active ? 'green' : 'red'}>{c.active ? 'Active' : 'Inactive'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {tab === 'Suppliers' && (
            <Card className="animate-in">
              <CardHeader><CardTitle>Supplier Master ({suppliers.length})</CardTitle><Button variant="primary" onClick={() => setShowModal(true)}>+ Add Supplier</Button></CardHeader>
              {suppliers.length === 0 ? <Empty message="No suppliers added yet" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>Code</th><th>Name</th><th>Contact</th><th>GST No.</th><th>Items Supplied</th></tr></thead>
                    <tbody>
                      {suppliers.map(s => (
                        <tr key={s.id}>
                          <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{s.code}</td>
                          <td style={{ fontWeight: 500 }}>{s.name}</td>
                          <td style={{ color: '#8892a4' }}>{s.contact}</td>
                          <td style={{ color: '#8892a4', fontSize: 11 }}>{s.gstNo || '—'}</td>
                          <td style={{ color: '#8892a4' }}>{s.items || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {tab === 'Job Types' && (
            <Card className="animate-in">
              <CardHeader><CardTitle>Job Type Master</CardTitle></CardHeader>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Code</th><th>Job Type</th><th>Base Rate</th><th>GST %</th><th>TAT (Days)</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      { code: 'JT01', name: 'Offset Printing', rate: '₹8.50/sheet', gst: 18, tat: 3 },
                      { code: 'JT02', name: 'Digital Printing', rate: '₹12.00/sheet', gst: 18, tat: 1 },
                      { code: 'JT03', name: 'Flex Banner', rate: '₹85/sqft', gst: 18, tat: 1 },
                      { code: 'JT04', name: 'Packaging', rate: 'Quotation', gst: 12, tat: 5 },
                      { code: 'JT05', name: 'Screen Printing', rate: '₹5.00/sheet', gst: 18, tat: 2 },
                    ].map(jt => (
                      <tr key={jt.code}>
                        <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{jt.code}</td>
                        <td style={{ fontWeight: 500 }}>{jt.name}</td>
                        <td style={{ color: '#10b981' }}>{jt.rate}</td>
                        <td><Badge color="blue">{jt.gst}%</Badge></td>
                        <td>{jt.tat} {jt.tat === 1 ? 'day' : 'days'}</td>
                        <td><Badge color="green">Active</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'Items / GST' && (
            <Card className="animate-in">
              <CardHeader><CardTitle>Item / GST Master</CardTitle><Button variant="primary">+ Add Item</Button></CardHeader>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>HSN Code</th><th>Item Name</th><th>Unit</th><th>GST %</th><th>Sale Rate</th><th>Stock</th><th>Min Stock</th></tr></thead>
                  <tbody>
                    {[
                      { hsn: '48025590', name: 'Maplitho Paper A4 70 GSM', unit: 'KG', gst: 18, rate: 62, stock: 480, min: 100 },
                      { hsn: '32081010', name: 'Offset Ink CMYK Set', unit: 'KG', gst: 18, rate: 850, stock: 4, min: 10 },
                      { hsn: '39206990', name: 'PVC Flex Sheet', unit: 'SQ FT', gst: 18, rate: 35, stock: 240, min: 50 },
                      { hsn: '48109900', name: 'Art Paper 130 GSM', unit: 'KG', gst: 18, rate: 78, stock: 120, min: 50 },
                      { hsn: '39201090', name: 'Lamination Film (Matt)', unit: 'ROLL', gst: 18, rate: 1800, stock: 3, min: 5 },
                    ].map(item => (
                      <tr key={item.hsn}>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#8892a4' }}>{item.hsn}</td>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td style={{ color: '#8892a4' }}>{item.unit}</td>
                        <td><Badge color="blue">{item.gst}%</Badge></td>
                        <td style={{ color: '#10b981' }}>₹{item.rate}/{item.unit.toLowerCase()}</td>
                        <td><Badge color={item.stock < item.min ? 'red' : 'green'}>{item.stock} {item.unit}</Badge></td>
                        <td style={{ color: '#8892a4' }}>{item.min}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Client Modal */}
      {tab === 'Clients' && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Client"
          footer={<>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveClient} disabled={saving}>{saving ? 'Saving...' : '💾 Save Client'}</Button>
          </>}>
          <form onSubmit={saveClient}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormGroup label="Name *"><Input value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} required /></FormGroup>
              <FormGroup label="Contact *"><Input value={clientForm.contact} onChange={e => setClientForm(f => ({ ...f, contact: e.target.value }))} required /></FormGroup>
              <FormGroup label="Email"><Input type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} /></FormGroup>
              <FormGroup label="City"><Input value={clientForm.city} onChange={e => setClientForm(f => ({ ...f, city: e.target.value }))} /></FormGroup>
              <FormGroup label="GST No."><Input value={clientForm.gstNo} onChange={e => setClientForm(f => ({ ...f, gstNo: e.target.value }))} placeholder="09XXXXX1234Z1ZX" /></FormGroup>
              <FormGroup label="Credit Limit (₹)"><Input type="number" value={clientForm.creditLimit} onChange={e => setClientForm(f => ({ ...f, creditLimit: e.target.value }))} /></FormGroup>
            </div>
          </form>
        </Modal>
      )}

      {/* Supplier Modal */}
      {tab === 'Suppliers' && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Supplier"
          footer={<>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveSupplier} disabled={saving}>{saving ? 'Saving...' : '💾 Save Supplier'}</Button>
          </>}>
          <form onSubmit={saveSupplier}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormGroup label="Name *"><Input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} required /></FormGroup>
              <FormGroup label="Contact *"><Input value={supplierForm.contact} onChange={e => setSupplierForm(f => ({ ...f, contact: e.target.value }))} required /></FormGroup>
              <FormGroup label="Email"><Input type="email" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></FormGroup>
              <FormGroup label="GST No."><Input value={supplierForm.gstNo} onChange={e => setSupplierForm(f => ({ ...f, gstNo: e.target.value }))} /></FormGroup>
            </div>
            <FormGroup label="Items Supplied"><Input value={supplierForm.items} onChange={e => setSupplierForm(f => ({ ...f, items: e.target.value }))} placeholder="e.g. Paper, Boards, Inks" /></FormGroup>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
