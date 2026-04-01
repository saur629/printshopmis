'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, Button, Modal, FormGroup, Input, Select, Textarea, Card, CardHeader, CardTitle, Loading, Empty } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SmsPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ clientId: '', mobile: '', recipientType: 'single', templateId: '', message: '' })
  const [newTplForm, setNewTplForm] = useState({ name: '', content: '', isAuto: false })
  const [showTplModal, setShowTplModal] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/sms').then(r => r.json()),
      fetch('/api/masters/clients').then(r => r.json()),
    ]).then(([smsData, cls]) => {
      setTemplates(smsData.templates || [])
      setLogs(smsData.logs || [])
      setClients(Array.isArray(cls) ? cls : [])
      setLoading(false)
    })
  }, [])

  function applyTemplate(tplId: string) {
    const tpl = templates.find(t => t.id === tplId)
    if (!tpl) return
    const client = clients.find(c => c.id === form.clientId)
    let msg = tpl.content
      .replace('{shop_name}', process.env.NEXT_PUBLIC_SHOP_NAME || 'PrintFlow')
      .replace('{shop_phone}', process.env.NEXT_PUBLIC_SHOP_PHONE || '9876500000')
    if (client) {
      msg = msg.replace('{client_name}', client.name)
      setForm(f => ({ ...f, mobile: client.contact, templateId: tplId, message: msg }))
    } else {
      setForm(f => ({ ...f, templateId: tplId, message: msg }))
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!form.mobile || !form.message) { toast.error('Mobile and message required'); return }
    setSending(true)
    try {
      const res = await fetch('/api/sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: form.clientId || null, mobile: form.mobile, message: form.message, template: templates.find(t => t.id === form.templateId)?.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLogs(prev => [data, ...prev])
      setShowModal(false)
      setForm({ clientId: '', mobile: '', recipientType: 'single', templateId: '', message: '' })
      toast.success('SMS sent successfully!')
    } catch (e: any) { toast.error(e.message || 'Failed to send SMS') }
    setSending(false)
  }

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault()
    // In a real app, POST to /api/sms/templates
    setTemplates(prev => [...prev, { id: Date.now().toString(), ...newTplForm }])
    setShowTplModal(false)
    setNewTplForm({ name: '', content: '', isAuto: false })
    toast.success('Template saved!')
  }

  const deliveredCount = logs.filter(l => l.status === 'SENT').length
  const balance = 58 // would come from Twilio API in production

  return (
    <PageShell title="SMS Alerts" action={{ label: '📱 Send SMS', onClick: () => setShowModal(true) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Sent This Month</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{logs.length}</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Delivery Rate</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>{logs.length ? Math.round((deliveredCount / logs.length) * 100) : 0}%</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>SMS Credits Left</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{balance}</div>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <Button onClick={() => setShowTplModal(true)}>+ New Template</Button>
            </CardHeader>
            <div style={{ padding: '8px 12px' }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', transition: 'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a3348')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{tpl.name}</span>
                    {tpl.isAuto && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: 'rgba(59,130,246,.15)', color: '#3b82f6', fontWeight: 600 }}>AUTO</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.5 }}>{tpl.content}</div>
                </div>
              ))}
              {templates.length === 0 && <Empty message="No templates yet" />}
            </div>
          </Card>

          {/* SMS Log */}
          <Card>
            <CardHeader><CardTitle>SMS Log</CardTitle></CardHeader>
            {logs.length === 0 ? <Empty message="No SMS sent yet" /> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Time</th><th>Mobile</th><th>Template</th><th>Status</th></tr></thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ color: '#8892a4', fontSize: 11 }}>{formatDate(log.sentAt)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.mobile}</td>
                        <td style={{ color: '#8892a4', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.template || 'Custom'}</td>
                        <td><Badge color={log.status === 'SENT' ? 'green' : 'red'}>{log.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Send SMS Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Send SMS"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : '📱 Send SMS'}</Button>
        </>}>
        <form onSubmit={handleSend}>
          <FormGroup label="Select Client (Optional)">
            <Select value={form.clientId} onChange={e => { setForm(f => ({ ...f, clientId: e.target.value, mobile: clients.find(c => c.id === e.target.value)?.contact || f.mobile })) }}>
              <option value="">Manual Entry</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.contact}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Mobile Number *">
            <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="10-digit mobile number" required />
          </FormGroup>
          <FormGroup label="Use Template">
            <Select value={form.templateId} onChange={e => applyTemplate(e.target.value)}>
              <option value="">Select template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Message *">
            <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Type your message..." required />
            <div style={{ fontSize: 10, color: '#8892a4', marginTop: 4, textAlign: 'right' }}>{form.message.length}/160 chars</div>
          </FormGroup>
        </form>
      </Modal>

      {/* New Template Modal */}
      <Modal open={showTplModal} onClose={() => setShowTplModal(false)} title="New SMS Template"
        footer={<>
          <Button onClick={() => setShowTplModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveTemplate}>💾 Save Template</Button>
        </>}>
        <FormGroup label="Template Name *">
          <Input value={newTplForm.name} onChange={e => setNewTplForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Job Delivery Reminder" required />
        </FormGroup>
        <FormGroup label="Message Content *">
          <Textarea value={newTplForm.content} onChange={e => setNewTplForm(f => ({ ...f, content: e.target.value }))} rows={4}
            placeholder="Use variables: {client_name}, {job_id}, {inv_no}, {amount}, {due_date}, {shop_name}" required />
        </FormGroup>
        <div style={{ fontSize: 11, color: '#8892a4', background: '#1e2535', borderRadius: 8, padding: '8px 10px', lineHeight: 1.8 }}>
          <strong style={{ color: '#e2e8f0' }}>Available variables:</strong><br />
          {'{client_name}'} — Client name<br />
          {'{job_id}'} — Job card number<br />
          {'{inv_no}'} — Invoice number<br />
          {'{amount}'} — Amount<br />
          {'{due_date}'} — Due date<br />
          {'{shop_name}'} — Shop name<br />
          {'{shop_phone}'} — Shop phone
        </div>
      </Modal>
    </PageShell>
  )
}
