'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, Button, Modal, FormGroup, Input, Select, Card, CardHeader, CardTitle, Loading } from '@/components/ui'
import toast from 'react-hot-toast'

const MODULES = [
  'Dashboard', 'Job Cards (View)', 'Job Cards (Create)', 'Job Cards (Approve)',
  'Quotations', 'Invoices', 'Payments', 'Purchase Orders',
  'Attendance (View)', 'Attendance (Mark)', 'Reports (Basic)', 'Reports (Financial)',
  'Access Control', 'Masters', 'SMS Alerts',
]

const PERMISSIONS: Record<string, Record<string, boolean>> = {
  'Dashboard':              { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: true,  USER: true  },
  'Job Cards (View)':       { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: true,  USER: true  },
  'Job Cards (Create)':     { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: true,  USER: false },
  'Job Cards (Approve)':    { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Quotations':             { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Invoices':               { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Payments':               { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Purchase Orders':        { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Attendance (View)':      { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: true,  USER: false },
  'Attendance (Mark)':      { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Reports (Basic)':        { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: true,  USER: false },
  'Reports (Financial)':    { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'Access Control':         { SUPER_ADMIN: true,  ADMIN: false, OPERATOR: false, USER: false },
  'Masters':                { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
  'SMS Alerts':             { SUPER_ADMIN: true,  ADMIN: true,  OPERATOR: false, USER: false },
}

const ROLE_COLORS: Record<string, string> = { SUPER_ADMIN: 'purple', ADMIN: 'blue', OPERATOR: 'yellow', USER: 'gray' }

export default function AccessControlPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', password: '', userRole: 'OPERATOR', mobile: '' })

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(us => { setUsers(us); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      const user = await res.json()
      setUsers(prev => [...prev, user])
      setShowModal(false)
      setForm({ name: '', username: '', password: '', userRole: 'OPERATOR', mobile: '' })
      toast.success(`User ${user.name} created!`)
    } catch (e: any) { toast.error(e.message || 'Failed to create user') }
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
    if (res.ok) { setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !active } : u)); toast.success('User updated') }
  }

  return (
    <PageShell title="Access Control" action={{ label: '+ Add User', onClick: () => setShowModal(true) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Roles Defined</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>4</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Active Users</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{users.filter(u => u.active).length}</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Inactive Users</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{users.filter(u => !u.active).length}</div>
        </div>
      </div>

      {/* Permission Matrix */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Role Permission Matrix</CardTitle>
        </CardHeader>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Module / Permission</th>
                <th style={{ textAlign: 'center' }}>Super Admin</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Operator</th>
                <th style={{ textAlign: 'center' }}>User</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <tr key={mod}>
                  <td style={{ fontWeight: 500 }}>{mod}</td>
                  {['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'USER'].map(role => (
                    <td key={role} style={{ textAlign: 'center' }}>
                      {PERMISSIONS[mod][role]
                        ? <span style={{ color: '#10b981', fontSize: 16 }}>✔</span>
                        : <span style={{ color: '#ef4444', fontSize: 14 }}>✗</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Add User</Button>
        </CardHeader>
        {loading ? <Loading /> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Mobile</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td style={{ color: '#8892a4', fontFamily: 'monospace', fontSize: 11 }}>{user.username}</td>
                    <td><Badge color={ROLE_COLORS[user.role]}>{user.role.replace('_', ' ')}</Badge></td>
                    <td style={{ color: '#8892a4' }}>{user.mobile || '—'}</td>
                    <td><Badge color={user.active ? 'green' : 'red'}>{user.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <Button size="sm" onClick={() => toggleActive(user.id, user.active)}>
                        {user.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User"
        footer={<>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : '💾 Create User'}</Button>
        </>}>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Full Name *">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" required />
            </FormGroup>
            <FormGroup label="Username *">
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="login username" required />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Password *">
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} />
            </FormGroup>
            <FormGroup label="Mobile">
              <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="10-digit mobile" />
            </FormGroup>
          </div>
          <FormGroup label="Role *">
            <Select value={form.userRole} onChange={e => setForm(f => ({ ...f, userRole: e.target.value }))}>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
              <option value="USER">User (View Only)</option>
            </Select>
          </FormGroup>
        </form>
      </Modal>
    </PageShell>
  )
}
