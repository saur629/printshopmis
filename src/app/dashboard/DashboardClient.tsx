'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard, Badge, Card, CardHeader, CardTitle, CardBody } from '@/components/ui'
import { formatCurrency, formatDate, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/utils'

const monthlyRevenue = [
  { month: 'Apr', revenue: 124000 }, { month: 'May', revenue: 138500 },
  { month: 'Jun', revenue: 152000 }, { month: 'Jul', revenue: 148000 },
  { month: 'Aug', revenue: 161000 }, { month: 'Sep', revenue: 158000 },
  { month: 'Oct', revenue: 172000 }, { month: 'Nov', revenue: 168000 },
  { month: 'Dec', revenue: 145000 }, { month: 'Jan', revenue: 159000 },
  { month: 'Feb', revenue: 176000 }, { month: 'Mar', revenue: 184500 },
]

const jobTypePie = [
  { name: 'Offset', value: 40, color: '#3b82f6' },
  { name: 'Digital', value: 24, color: '#10b981' },
  { name: 'Flex', value: 13, color: '#f59e0b' },
  { name: 'Packaging', value: 23, color: '#8b5cf6' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: '#8892a4' }}>{payload[0].payload.month}</div>
        <div style={{ color: '#3b82f6', fontWeight: 600 }}>₹{(payload[0].value / 1000).toFixed(0)}K</div>
      </div>
    )
  }
  return null
}

interface Props {
  stats: { totalJobs: number; pendingJobs: number; clients: number; totalBilled: number; outstanding: number }
  recentJobs: any[]
}

export function DashboardClient({ stats, recentJobs }: Props) {
  return (
    <div className="animate-in">
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Jobs" value={stats.totalJobs} icon="📋" color="blue" sub="All time" />
        <StatCard label="Revenue (Billed)" value={formatCurrency(stats.totalBilled)} icon="💰" color="green" sub="Total invoiced" />
        <StatCard label="Pending Jobs" value={stats.pendingJobs} icon="⏳" color="yellow" sub="Active in production" />
        <StatCard label="Outstanding" value={formatCurrency(stats.outstanding)} icon="💸" color="red" sub="Unpaid invoices" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <span style={{ fontSize: 11, color: '#8892a4' }}>FY 2025–26</span>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={monthlyRevenue} barSize={18}>
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Job Type Split</CardTitle></CardHeader>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PieChart width={90} height={90}>
                <Pie data={jobTypePie} cx={40} cy={40} innerRadius={26} outerRadius={42} dataKey="value" strokeWidth={0}>
                  {jobTypePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div>
                {jobTypePie.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ color: '#8892a4' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, color: '#e2e8f0', marginLeft: 'auto' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Cards</CardTitle>
            <a href="/job-cards" style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none' }}>View All →</a>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Job ID</th><th>Client</th><th>Type</th><th>Status</th><th>Due</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#8892a4', padding: 20 }}>No jobs yet. Create your first job card.</td></tr>
                ) : recentJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 11 }}>{job.jobNo}</td>
                    <td>{job.client?.name}</td>
                    <td style={{ color: '#8892a4' }}>{job.jobType?.name}</td>
                    <td><Badge color={JOB_STATUS_COLORS[job.status] || 'gray'}>{JOB_STATUS_LABELS[job.status]}</Badge></td>
                    <td style={{ color: '#8892a4', fontSize: 11 }}>{job.dueDate ? formatDate(job.dueDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { href: '/job-cards', icon: '📋', label: 'New Job Card', color: '#3b82f6' },
                { href: '/quotation', icon: '📝', label: 'New Quotation', color: '#10b981' },
                { href: '/invoice', icon: '🧾', label: 'New Invoice', color: '#f59e0b' },
                { href: '/payments', icon: '💳', label: 'Record Payment', color: '#8b5cf6' },
                { href: '/purchase', icon: '🛒', label: 'New Purchase', color: '#f97316' },
                { href: '/attendance', icon: '🕐', label: 'Mark Attendance', color: '#14b8a6' },
                { href: '/reports', icon: '📈', label: 'View Reports', color: '#ef4444' },
                { href: '/sms', icon: '📱', label: 'Send SMS', color: '#3b82f6' },
              ].map(item => (
                <a key={item.href} href={item.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, textDecoration: 'none', color: '#e2e8f0', fontSize: 12, fontWeight: 500, transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = item.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a3348')}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
