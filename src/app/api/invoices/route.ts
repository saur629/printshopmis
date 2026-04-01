import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where: any = {}
  if (status) where.status = status

  const invoices = await prisma.invoice.findMany({
    where,
    include: { client: true, items: true, payments: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clientId, dueDate, items, notes } = body

  if (!clientId || !items?.length) {
    return NextResponse.json({ error: 'clientId and items required' }, { status: 400 })
  }

  const count = await prisma.invoice.count()
  const invNo = `INV-${String(count + 1).padStart(4, '0')}`

  let subTotal = 0, gstAmount = 0
  const processedItems = items.map((item: any) => {
    const amount = item.qty * item.rate
    const gst = (amount * (item.gstPct || 18)) / 100
    subTotal += amount
    gstAmount += gst
    return { ...item, amount, gstAmount: gst, totalAmount: amount + gst }
  })

  const totalAmount = subTotal + gstAmount

  const invoice = await prisma.invoice.create({
    data: {
      invNo, clientId, notes,
      dueDate: new Date(dueDate),
      subTotal, gstAmount, totalAmount,
      status: 'UNPAID',
      items: { create: processedItems },
    },
    include: { client: true, items: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
