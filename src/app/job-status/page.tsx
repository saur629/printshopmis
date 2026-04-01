'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, Card, Button, Loading, Empty } from '@/components/ui'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'RECEIVED', label: 'Received' },
  { key: 'PRE_PRESS', label: 'Pre-Press' },
  { key: 'IN_PRESS', label: 'In Press' },
  { key: 'CUTTING', label: 'Cutting' },
  { key: 'BINDING', label: 'Binding' },
  { key: 'QUALITY_CHECK', label: 'Quality Check' },
  { key: 'READY', label: 'Ready / Dispatch' },
  { key: 'DISPATCHED', label: 'Dispatched' },
]

const VISIBLE_COLS = ['PRE_PRESS', 'IN_PRESS', 'CUTTING', 'READY']

export default function JobStatusPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/job-cards').then(r => r.json()).then(d => {
      setJobs(d.jobs || [])
      setLoading(false)
    })
  }, [])

  async function moveJob(id: string, status: string) {
    const res = await fetch(`/api/job-cards/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
      toast.success('Job status updated')
    }
  }

  const colJobs = (key: string) => jobs.filter(j => j.status === key)

  return (
    <PageShell title="Job Status Board">
      {loading ? <Loading /> : (
        <div className="animate-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {VISIBLE_COLS.map(colKey => {
              const col = COLUMNS.find(c => c.key === colKey)!
              const colData = colJobs(colKey)
              return (
                <Card key={colKey}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3348', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{col.label}</span>
                    <Badge color={JOB_STATUS_COLORS[colKey]}>{colData.length}</Badge>
                  </div>
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 200 }}>
                    {colData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#8892a4', fontSize: 11 }}>No jobs</div>
                    ) : colData.map(job => (
                      <div key={job.id} style={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, padding: 10, cursor: 'pointer', transition: 'border-color .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a3348')}>
                        <div style={{ fontSize: 9, color: '#8892a4', marginBottom: 2, fontFamily: 'monospace' }}>{job.jobNo}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{job.description?.slice(0, 40)}{job.description?.length > 40 ? '...' : ''}</div>
                        <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 8 }}>{job.client?.name}</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {COLUMNS.filter(c => c.key !== colKey && c.key !== 'CANCELLED').map(nextCol => (
                            <button key={nextCol.key} onClick={() => moveJob(job.id, nextCol.key)}
                              style={{ padding: '2px 6px', fontSize: 9, borderRadius: 4, border: '1px solid #3a4560', background: 'transparent', color: '#8892a4', cursor: 'pointer' }}>
                              → {nextCol.label}
                            </button>
                          ))}
                        </div>
                        {job.dueDate && (
                          <div style={{ marginTop: 6, fontSize: 10, color: new Date(job.dueDate) < new Date() ? '#ef4444' : '#8892a4' }}>
                            Due: {formatDate(job.dueDate)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </PageShell>
  )
}
