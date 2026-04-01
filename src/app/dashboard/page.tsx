import { Topbar } from '@/components/layout/Topbar'
import { DashboardClient } from './DashboardClient'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  // Fetch real stats
  const [totalJobs, pendingJobs, clients, recentJobs] = await Promise.all([
    prisma.jobCard.count(),
    prisma.jobCard.count({ where: { status: { in: ['RECEIVED', 'PRE_PRESS', 'IN_PRESS'] } } }),
    prisma.client.count(),
    prisma.jobCard.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { client: true, jobType: true },
    }),
  ])

  const invoiceStats = await prisma.invoice.aggregate({
    _sum: { totalAmount: true, paidAmount: true },
  })

  const totalBilled = invoiceStats._sum.totalAmount || 0
  const totalPaid = invoiceStats._sum.paidAmount || 0
  const outstanding = totalBilled - totalPaid

  const stats = { totalJobs, pendingJobs, clients, totalBilled, outstanding }

  return (
    <>
      <Topbar title="Dashboard Overview" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#0f1117' }}>
        <DashboardClient stats={stats} recentJobs={JSON.parse(JSON.stringify(recentJobs))} />
      </div>
    </>
  )
}
