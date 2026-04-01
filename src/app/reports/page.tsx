'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard, Button, Card, CardHeader, CardTitle, CardBody, Badge, Loading } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const TABS = ['Revenue', 'Job-wise', 'Client-wise', 'Expense']

const MONTHLY_SAMPLE = [
  { month: 'Apr', revenue: 124000, expenses: 78200 }, { month: 'May', revenue: 138500, expenses: 84100 },
  { month: 'Jun', revenue: 152000, expenses: 91000 }, { month: 'Jul', revenue: 148000, expenses: 89000 },
  { month: 'Aug', revenue: 161000, expenses: 95000 }, { month: 'Sep', revenue: 158000, expenses: 93000 },
  { month: 'Oct', revenue: 172000, expenses: 102000 }, { month: 'Nov', revenue: 168000, expenses: 99000 },
  { month: 'Dec', revenue: 145000, expenses: 87000 }, { month: 'Jan', revenue: 159000, expenses: 94000 },
  { month: 'Feb', revenue: 176000, expenses: 104000 }, { month: 'Mar', revenue: 184500, expenses: 110200 },
]

const EXPENSE_DATA = [
  { name: 'Paper & Material', value: 52000, color: '#3b82f6' },
  { name: 'Ink & Consumables', value: 18400, color: '#10b981' },
  { name: 'Staff Salary', value: 28000, color: '#f59e0b' },
  { name: 'Power & Utilities', value: 7800, color: '#8b5cf6' },
  { name: 'Maintenance', value: 4000, color: '#ef4444' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ color: '#8892a4', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</div>)}
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Revenue')
  const [summary, setSummary] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/reports?type=summary').then(r => r.json()),
      fetch('/api/reports?type=clients').then(r => r.json()),
    ]).then(([sum, cls]) => { setSummary(sum); setClients(Array.isArray(cls) ? cls : []); setLoading(false) })
  }, [])

  const totalRevenueFY = MONTHLY_SAMPLE.reduce((s, m) => s + m.revenue, 0)
  const totalExpenseFY = MONTHLY_SAMPLE.reduce((s, m) => s + m.expenses, 0)
  const netProfit = totalRevenueFY - totalExpenseFY
  const margin = Math.round((netProfit / totalRevenueFY) * 100)

  return (
    <PageShell title="Reports & Analytics">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, padding: 3, background: '#1e2535', borderRadius: 8, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '5px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s', background: activeTab === tab ? '#161b27' : 'transparent', color: activeTab === tab ? '#e2e8f0' : '#8892a4' }}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <>
          {activeTab === 'Revenue' && (
            <div className="animate-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard label="Total Revenue FY" value={formatCurrency(totalRevenueFY)} icon="📈" color="blue" />
                <StatCard label="Total Expenses FY" value={formatCurrency(totalExpenseFY)} icon="💸" color="yellow" />
                <StatCard label="Net Profit FY" value={formatCurrency(netProfit)} icon="📊" color="green" />
                <StatCard label="Profit Margin" value={`${margin}%`} icon="🎯" color="green" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue vs Expenses</CardTitle>
                    <Button>⬇️ Export</Button>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={MONTHLY_SAMPLE} barSize={12} barGap={2}>
                        <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3,3,0,0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Monthly P&amp;L</CardTitle></CardHeader>
                  <div style={{ overflowY: 'auto', maxHeight: 260 }}>
                    <table>
                      <thead><tr><th>Month</th><th>Revenue</th><th>Profit</th></tr></thead>
                      <tbody>
                        {MONTHLY_SAMPLE.map(m => (
                          <tr key={m.month}>
                            <td>{m.month}</td>
                            <td style={{ color: '#10b981' }}>{formatCurrency(m.revenue)}</td>
                            <td><Badge color="green">{Math.round(((m.revenue - m.expenses) / m.revenue) * 100)}%</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'Job-wise' && (
            <div className="animate-in">
              <Card>
                <CardHeader><CardTitle>Job Type Analysis</CardTitle><Button>⬇️ Export</Button></CardHeader>
                <CardBody>
                  <table>
                    <thead><tr><th>Job Type</th><th>Jobs</th><th>Revenue</th><th>Avg Value</th></tr></thead>
                    <tbody>
                      {[
                        { type: 'Offset Printing', jobs: 90, revenue: 740000 },
                        { type: 'Digital Print', jobs: 55, revenue: 440000 },
                        { type: 'Packaging', jobs: 51, revenue: 424000 },
                        { type: 'Flex/Vinyl', jobs: 30, revenue: 241000 },
                      ].map(row => (
                        <tr key={row.type}>
                          <td style={{ fontWeight: 500 }}>{row.type}</td>
                          <td>{row.jobs}</td>
                          <td style={{ color: '#10b981' }}>{formatCurrency(row.revenue)}</td>
                          <td style={{ color: '#8892a4' }}>{formatCurrency(Math.round(row.revenue / row.jobs))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'Client-wise' && (
            <div className="animate-in">
              <Card>
                <CardHeader><CardTitle>Top Clients</CardTitle><Button>⬇️ Export</Button></CardHeader>
                {clients.length === 0 ? (
                  <CardBody><div style={{ textAlign: 'center', color: '#8892a4', padding: 20 }}>No client data yet</div></CardBody>
                ) : (
                  <table>
                    <thead><tr><th>Client</th><th>City</th><th>Jobs</th><th>Total Billed</th><th>Paid</th><th>Outstanding</th></tr></thead>
                    <tbody>
                      {clients.map(c => {
                        const outstanding = c.totalBilled - c.totalPaid
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 500 }}>{c.name}</td>
                            <td style={{ color: '#8892a4' }}>{c.city || '—'}</td>
                            <td>{c.jobs}</td>
                            <td style={{ color: '#10b981' }}>{formatCurrency(c.totalBilled)}</td>
                            <td>{formatCurrency(c.totalPaid)}</td>
                            <td><Badge color={outstanding > 0 ? 'red' : 'green'}>{formatCurrency(outstanding)}</Badge></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'Expense' && (
            <div className="animate-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <CardHeader><CardTitle>Expense Breakdown (This Month)</CardTitle></CardHeader>
                  <CardBody>
                    <table>
                      <thead><tr><th>Category</th><th>Amount</th><th>% of Total</th></tr></thead>
                      <tbody>
                        {EXPENSE_DATA.map(e => {
                          const total = EXPENSE_DATA.reduce((s, x) => s + x.value, 0)
                          return (
                            <tr key={e.name}>
                              <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                                {e.name}
                              </td>
                              <td style={{ color: '#e2e8f0' }}>{formatCurrency(e.value)}</td>
                              <td><Badge color="blue">{Math.round((e.value / total) * 100)}%</Badge></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Expense Distribution</CardTitle></CardHeader>
                  <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <PieChart width={160} height={160}>
                        <Pie data={EXPENSE_DATA} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                          {EXPENSE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </div>
                    {EXPENSE_DATA.map(e => (
                      <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, color: '#8892a4' }}>{e.name}</span>
                        <span style={{ fontWeight: 500 }}>{formatCurrency(e.value)}</span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
