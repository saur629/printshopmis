'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { StatCard, Badge, Button, Modal, FormGroup, Input, Select, Textarea, Card, CardHeader, CardTitle, Empty } from '@/components/ui'
import { formatCurrency, formatDate, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/utils'

const STATUSES = ['RECEIVED','PRE_PRESS','IN_PRESS','CUTTING','BINDING','QUALITY_CHECK','READY','DISPATCHED','CANCELLED']

interface Props {
  initialJobs: any[]; clients: any[]; jobTypes: any[]; operators: any[]
}

export function JobCardsClient({ initialJobs, clients, jobTypes, operators }: Props) {
  const [jobs, setJobs] = useState(initialJobs)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewJob, setViewJob] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientId: '', jobTypeId: '', description: '', qty: '', size: '', colors: '4-color (CMYK)',
    paper: '', instructions: '', operatorId: '', dueDate: '', rate: '', gstPct: '18',
  })

  const filtered = filterStatus ? jobs.filter(j => j.status === filterStatus) : jobs

  const counts = {
    total: jobs.length,
    pending: jobs.filter(j => ['RECEIVED','PRE_PRESS'].includes(j.status)).length,
    inPress: jobs.filter(j => j.status === 'IN_PRESS').length,
    done: jobs.filter(j => ['READY','DISPATCHED'].includes(j.status)).length,
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/job-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const newJob = await res.json()
      setJobs(prev => [newJob, ...prev])
      setShowModal(false)
      setForm({ clientId:'',jobTypeId:'',description:'',qty:'',size:'',colors:'4-color (CMYK)',paper:'',instructions:'',operatorId:'',dueDate:'',rate:'',gstPct:'18' })
      toast.success(`Job Card ${newJob.jobNo} created!`)
    } catch {
      toast.error('Failed to create job card')
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/job-cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
      if (viewJob?.id === id) setViewJob((v: any) => ({ ...v, status }))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const totalAmt = (parseFloat(form.rate)||0) * (parseInt(form.qty)||0)
  const gstAmt = totalAmt * (parseFloat(form.gstPct)||18) / 100

  return (
    <div className="animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Active" value={counts.total} icon="📋" color="blue" />
        <StatCard label="Pending" value={counts.pending} icon="⏳" color="yellow" />
        <StatCard label="In Press" value={counts.inPress} icon="🖨️" color="blue" />
        <StatCard label="Completed" value={counts.done} icon="✅" color="green" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Job Cards</CardTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <Select style={{ width: 140, padding: '5px 8px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{JOB_STATUS_LABELS[s]}</option>)}
            </Select>
            <Button variant="primary" onClick={() => setShowModal(true)}>+ New Job Card</Button>
          </div>
        </CardHeader>
        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? <Empty message="No job cards found" /> : (
            <table>
              <thead>
                <tr>
                  <th>Job ID</th><th>Date</th><th>Client</th><th>Description</th><th>Qty</th><th>Operator</th><th>Amount</th><th>Status</th><th>Due</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id}>
                    <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{job.jobNo}</td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{formatDate(job.date)}</td>
                    <td style={{ fontWeight: 500 }}>{job.client?.name}</td>
                    <td style={{ color: '#8892a4', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.description}</td>
                    <td>{job.qty?.toLocaleString()}</td>
                    <td style={{ color: '#8892a4' }}>{job.operator?.name || '—'}</td>
                    <td style={{ color: '#10b981' }}>{job.totalAmount ? formatCurrency(job.totalAmount) : '—'}</td>
                    <td><Badge color={JOB_STATUS_COLORS[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge></td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{job.dueDate ? formatDate(job.dueDate) : '—'}</td>
                    <td>
                      <Button size="sm" onClick={() => { setViewJob(job); setShowViewModal(true) }}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Job Card"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={loading}>{loading ? 'Saving...' : '💾 Save Job Card'}</Button>
        </>}>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Client *">
              <Select value={form.clientId} onChange={e => setForm(f=>({...f,clientId:e.target.value}))} required>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Job Type *">
              <Select value={form.jobTypeId} onChange={e => setForm(f=>({...f,jobTypeId:e.target.value}))} required>
                <option value="">Select Type</option>
                {jobTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Description *">
            <Input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Letterhead A4, 2-color, offset" required />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormGroup label="Quantity *">
              <Input type="number" value={form.qty} onChange={e => setForm(f=>({...f,qty:e.target.value}))} placeholder="0" required />
            </FormGroup>
            <FormGroup label="Size">
              <Input value={form.size} onChange={e => setForm(f=>({...f,size:e.target.value}))} placeholder="A4 / 12x18 / Custom" />
            </FormGroup>
            <FormGroup label="Colors">
              <Select value={form.colors} onChange={e => setForm(f=>({...f,colors:e.target.value}))}>
                <option>1-color</option><option>2-color</option><option>4-color (CMYK)</option><option>Spot Color</option>
              </Select>
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Operator">
              <Select value={form.operatorId} onChange={e => setForm(f=>({...f,operatorId:e.target.value}))}>
                <option value="">Assign Operator</option>
                {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Due Date">
              <Input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} />
            </FormGroup>
          </div>
          <FormGroup label="Paper / Material">
            <Input value={form.paper} onChange={e => setForm(f=>({...f,paper:e.target.value}))} placeholder="e.g. 130 GSM Art Paper, Matt Lamination" />
          </FormGroup>
          <FormGroup label="Special Instructions">
            <Textarea value={form.instructions} onChange={e => setForm(f=>({...f,instructions:e.target.value}))} rows={2} placeholder="Folding, binding, packing, delivery notes..." />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormGroup label="Rate per Unit (₹)">
              <Input type="number" step="0.01" value={form.rate} onChange={e => setForm(f=>({...f,rate:e.target.value}))} placeholder="0.00" />
            </FormGroup>
            <FormGroup label="GST %">
              <Select value={form.gstPct} onChange={e => setForm(f=>({...f,gstPct:e.target.value}))}>
                <option value="18">18%</option><option value="12">12%</option><option value="5">5%</option><option value="0">0%</option>
              </Select>
            </FormGroup>
            <FormGroup label="Estimated Total">
              <div style={{ padding: '8px 10px', background: '#252d40', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                ₹{(totalAmt + gstAmt).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </FormGroup>
          </div>
        </form>
      </Modal>

      {/* View/Status Modal */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title={`Job Card — ${viewJob?.jobNo}`}
        footer={<Button onClick={() => setShowViewModal(false)}>Close</Button>}>
        {viewJob && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                ['Client', viewJob.client?.name], ['Job Type', viewJob.jobType?.name],
                ['Quantity', viewJob.qty?.toLocaleString()], ['Size', viewJob.size || '—'],
                ['Colors', viewJob.colors || '—'], ['Paper', viewJob.paper || '—'],
                ['Operator', viewJob.operator?.name || '—'], ['Due Date', viewJob.dueDate ? formatDate(viewJob.dueDate) : '—'],
                ['Amount', viewJob.amount ? formatCurrency(viewJob.amount) : '—'],
                ['Total (with GST)', viewJob.totalAmount ? formatCurrency(viewJob.totalAmount) : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: '#8892a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>
            {viewJob.description && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#8892a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Description</div>
                <div style={{ fontSize: 13 }}>{viewJob.description}</div>
              </div>
            )}
            {viewJob.instructions && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#8892a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Instructions</div>
                <div style={{ fontSize: 13, color: '#8892a4' }}>{viewJob.instructions}</div>
              </div>
            )}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: '#8892a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Update Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(viewJob.id, s)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${viewJob.status === s ? '#3b82f6' : '#2a3348'}`, background: viewJob.status === s ? 'rgba(59,130,246,0.15)' : '#1e2535', color: viewJob.status === s ? '#3b82f6' : '#8892a4', fontSize: 11, cursor: 'pointer', fontWeight: viewJob.status === s ? 600 : 400 }}>
                    {JOB_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
