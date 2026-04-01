import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payments = await prisma.payment.findMany({
    include: { client: true, invoice: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clientId, invoiceId, amount, mode, reference, notes } = body

  if (!clientId || !amount || !mode) {
    return NextResponse.json({ error: 'clientId, amount, mode required' }, { status: 400 })
  }

  const count = await prisma.payment.count()
  const receiptNo = `REC-${String(count + 1).padStart(4, '0')}`

  const payment = await prisma.payment.create({
    data: {
      receiptNo, clientId,
      invoiceId: invoiceId || null,
      amount: parseFloat(amount), mode, reference, notes,
      status: 'SETTLED',
    },
    include: { client: true, invoice: true },
  })

  // Update invoice paid amount if linked
  if (invoiceId) {
    const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (inv) {
      const newPaid = inv.paidAmount + parseFloat(amount)
      const newStatus = newPaid >= inv.totalAmount ? 'PAID' : 'PARTIAL'
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: newPaid, status: newStatus },
      })
    }
  }

  return NextResponse.json(payment, { status: 201 })
}
