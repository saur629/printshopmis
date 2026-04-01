'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard, Badge, Button, Modal, FormGroup, Input, Select, Textarea, Card, CardHeader, CardTitle, Loading, Empty } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const MODE_COLORS: Record<string, string> = { CASH: 'orange', UPI: 'blue', NEFT: 'teal', RTGS: 'teal', CHEQUE: 'purple', CARD: 'green' }
const STATUS_COLORS: Record<string, string> = { SETTLED: 'green', PARTIAL: 'yellow', PENDING: 'red' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ clientId: '', invoiceId: '', amount: '', mode: 'CASH', reference: '', notes: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/payments').then(r => r.json()),
      fetch('/api/masters/clients').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json()),
    ]).then(([pays, cls, invs]) => {
      setPayments(Array.isArray(pays) ? pays : [])
      setClients(cls)
      setInvoices(Array.isArray(invs) ? invs.filter((i: any) => i.status !== 'PAID') : [])
      setLoading(false)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const pay = await res.json()
      setPayments(prev => [pay, ...prev])
      setShowModal(false)
      setForm({ clientId: '', invoiceId: '', amount: '', mode: 'CASH', reference: '', notes: '' })
      toast.success(`Receipt ${pay.receiptNo} recorded!`)
    } catch { toast.error('Failed to record payment') }
    setSaving(false)
  }

  const totals = {
    today: payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((s, p) => s + p.amount, 0),
    month: payments.reduce((s, p) => s + p.amount, 0),
  }

  const clientInvoices = invoices.filter(i => i.clientId === form.clientId)

  return (
    <PageShell title="Payments" action={{ label: '+ Record Payment', onClick: () => setShowModal(true) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Received Today" value={formatCurrency(totals.today)} icon="💰" color="green" />
        <StatCard label="This Month" value={formatCurrency(totals.month)} icon="📊" color="blue" />
        <StatCard label="Total Records" value={payments.length} icon="🧾" color="yellow" />
        <StatCard label="UPI / Digital" value={payments.filter(p => ['UPI','NEFT','RTGS'].includes(p.mode)).length} icon="📱" color="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Ledger</CardTitle>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Record Payment</Button>
        </CardHeader>
        {loading ? <Loading /> : payments.length === 0 ? <Empty message="No payments recorded yet" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Receipt No.</th><th>Date</th><th>Client</th><th>Invoice</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{pay.receiptNo}</td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{formatDate(pay.date)}</td>
                    <td style={{ fontWeight: 500 }}>{pay.client?.name}</td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{pay.invoice?.invNo || '—'}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(pay.amount)}</td>
                    <td><Badge color={MODE_COLORS[pay.mode] || 'gray'}>{pay.mode}</Badge></td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{pay.reference || '—'}</td>
                    <td><Badge color={STATUS_COLORS[pay.status]}>{pay.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Payment"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : '💾 Save Payment'}</Button>
        </>}>
        <form onSubmit={handleCreate}>
          <FormGroup label="Client *">
            <Select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value, invoiceId: '' }))} required>
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormGroup>
          {form.clientId && (
            <FormGroup label="Against Invoice (Optional)">
              <Select value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}>
                <option value="">General Payment</option>
                {clientInvoices.map(i => (
                  <option key={i.id} value={i.id}>{i.invNo} — {formatCurrency(i.totalAmount - i.paidAmount)} due</option>
                ))}
              </Select>
            </FormGroup>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Amount (₹) *">
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
            </FormGroup>
            <FormGroup label="Payment Mode *">
              <Select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Card</option>
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Reference / TXN No.">
            <Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="UPI TXN / Cheque No. / NEFT Reference" />
          </FormGroup>
          <FormGroup label="Notes">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notes..." />
          </FormGroup>
        </form>
      </Modal>
    </PageShell>
  )
}
