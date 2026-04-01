import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { JobCardsClient } from './JobCardsClient'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function JobCardsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [jobs, clients, jobTypes, operators] = await Promise.all([
    prisma.jobCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, jobType: true, operator: { select: { id: true, name: true } } },
      take: 50,
    }),
    prisma.client.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.jobType.findMany({ where: { active: true } }),
    prisma.user.findMany({ where: { active: true, role: { in: ['OPERATOR', 'ADMIN'] } }, select: { id: true, name: true } }),
  ])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f1117' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Job Cards" />
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <JobCardsClient
            initialJobs={JSON.parse(JSON.stringify(jobs))}
            clients={JSON.parse(JSON.stringify(clients))}
            jobTypes={JSON.parse(JSON.stringify(jobTypes))}
            operators={JSON.parse(JSON.stringify(operators))}
          />
        </div>
      </main>
    </div>
  )
}
