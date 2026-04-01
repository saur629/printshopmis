import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'summary'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const dateFilter = from && to ? {
    gte: new Date(from), lte: new Date(to),
  } : undefined

  if (type === 'summary') {
    const [invoiceStats, jobStats, clientCount] = await Promise.all([
      prisma.invoice.aggregate({ _sum: { totalAmount: true, paidAmount: true, gstAmount: true } }),
      prisma.jobCard.groupBy({ by: ['status'], _count: true }),
      prisma.client.count(),
    ])

    const totalBilled = invoiceStats._sum.totalAmount || 0
    const totalPaid = invoiceStats._sum.paidAmount || 0

    return NextResponse.json({
      totalBilled, totalPaid,
      outstanding: totalBilled - totalPaid,
      totalGst: invoiceStats._sum.gstAmount || 0,
      jobsByStatus: jobStats,
      clientCount,
    })
  }

  if (type === 'monthly') {
    const invoices = await prisma.invoice.findMany({
      where: dateFilter ? { date: dateFilter } : undefined,
      orderBy: { date: 'asc' },
    })

    // Group by month
    const monthly: Record<string, { revenue: number; paid: number; jobs: number }> = {}
    invoices.forEach(inv => {
      const key = `${inv.date.getFullYear()}-${String(inv.date.getMonth() + 1).padStart(2, '0')}`
      if (!monthly[key]) monthly[key] = { revenue: 0, paid: 0, jobs: 0 }
      monthly[key].revenue += inv.totalAmount
      monthly[key].paid += inv.paidAmount
    })

    return NextResponse.json(Object.entries(monthly).map(([month, data]) => ({ month, ...data })))
  }

  if (type === 'clients') {
    const clients = await prisma.client.findMany({
      include: {
        invoices: { select: { totalAmount: true, paidAmount: true } },
        jobCards: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(clients.map(c => ({
      id: c.id, name: c.name, city: c.city,
      jobs: c.jobCards.length,
      totalBilled: c.invoices.reduce((s, i) => s + i.totalAmount, 0),
      totalPaid: c.invoices.reduce((s, i) => s + i.paidAmount, 0),
    })))
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
}
