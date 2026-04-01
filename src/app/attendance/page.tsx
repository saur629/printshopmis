'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, Button, Card, CardHeader, CardTitle, Select, Loading } from '@/components/ui'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = { PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', LEAVE: 'purple', HALF_DAY: 'orange' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AttendancePage() {
  const now = new Date()
  const [users, setUsers] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [todayAtt, setTodayAtt] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [loading, setLoading] = useState(true)

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(us => {
      setUsers(us)
      if (us.length > 0) setSelectedUser(us[0].id)
    })
    fetchToday()
  }, [])

  useEffect(() => {
    if (!selectedUser) return
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    fetch(`/api/attendance?userId=${selectedUser}&month=${monthStr}`).then(r => r.json()).then(setAttendance)
    setLoading(false)
  }, [selectedUser, year, month])

  function fetchToday() {
    fetch(`/api/attendance?date=${today}`).then(r => r.json()).then(setTodayAtt)
  }

  function getStatus(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return attendance.find(a => a.date?.startsWith(dateStr))?.status
  }

  async function markToday(userId: string, status: string) {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date: today, status, checkIn: status === 'PRESENT' || status === 'LATE' ? new Date().toTimeString().slice(0, 5) : null }),
    })
    if (res.ok) {
      fetchToday()
      toast.success('Attendance marked')
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthName = new Date(year, month, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const presentCount = todayAtt.filter(a => a.status === 'PRESENT').length
  const absentCount = users.length - todayAtt.length + todayAtt.filter(a => a.status === 'ABSENT').length
  const lateCount = todayAtt.filter(a => a.status === 'LATE').length

  const cellStyle = (status?: string) => {
    const base: React.CSSProperties = { aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, cursor: 'pointer' }
    if (!status) return { ...base, background: '#1e2535', color: '#8892a4' }
    const colors: Record<string, { bg: string; color: string }> = {
      PRESENT: { bg: 'rgba(16,185,129,.2)', color: '#10b981' },
      ABSENT: { bg: 'rgba(239,68,68,.12)', color: '#ef4444' },
      LATE: { bg: 'rgba(245,158,11,.15)', color: '#f59e0b' },
      LEAVE: { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6' },
      HALF_DAY: { bg: 'rgba(249,115,22,.15)', color: '#f97316' },
    }
    return { ...base, ...colors[status] }
  }

  return (
    <PageShell title="Attendance">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Present Today</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{presentCount}</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Absent</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{absentCount}</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #2a3348', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>Late / Leave</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{lateCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>{monthName}</CardTitle>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select style={{ width: 130, padding: '4px 8px', fontSize: 11 }} value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
              <Button size="sm" onClick={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)}>‹</Button>
              <Button size="sm" onClick={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)}>›</Button>
            </div>
          </CardHeader>
          <div style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#8892a4', padding: '3px 0' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const status = getStatus(day)
                return (
                  <div key={day} style={cellStyle(status)}>{day}</div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {Object.entries({ PRESENT: '#10b981', ABSENT: '#ef4444', LATE: '#f59e0b', LEAVE: '#8b5cf6' }).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c + '30', border: `1px solid ${c}` }} />
                  <span style={{ color: '#8892a4' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</CardTitle>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Staff</th><th>Role</th><th>Check In</th><th>Status</th><th>Mark</th></tr></thead>
              <tbody>
                {users.map(user => {
                  const att = todayAtt.find(a => a.userId === user.id)
                  return (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 500 }}>{user.name}</td>
                      <td style={{ color: '#8892a4', fontSize: 11 }}>{user.role.replace('_', ' ')}</td>
                      <td style={{ color: '#8892a4', fontSize: 11 }}>{att?.checkIn || '—'}</td>
                      <td>{att ? <Badge color={STATUS_COLOR[att.status]}>{att.status}</Badge> : <span style={{ color: '#8892a4', fontSize: 11 }}>Not marked</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {['PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map(s => (
                            <button key={s} onClick={() => markToday(user.id, s)}
                              style={{ padding: '2px 5px', fontSize: 9, borderRadius: 4, border: `1px solid ${att?.status === s ? '#3b82f6' : '#2a3348'}`, background: att?.status === s ? 'rgba(59,130,246,.15)' : 'transparent', color: att?.status === s ? '#3b82f6' : '#8892a4', cursor: 'pointer' }}>
                              {s[0]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
