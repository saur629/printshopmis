import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [purchases, items] = await Promise.all([
    prisma.purchase.findMany({
      include: { supplier: true, items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.item.findMany({ orderBy: { name: 'asc' } }),
  ])

  return NextResponse.json({ purchases, items })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { supplierId, items, notes } = body

  if (!supplierId || !items?.length) {
    return NextResponse.json({ error: 'supplierId and items required' }, { status: 400 })
  }

  const count = await prisma.purchase.count()
  const poNo = `PO-${String(count + 1).padStart(4, '0')}`

  let totalAmount = 0
  const processedItems = items.map((item: any) => {
    const amount = item.qty * item.rate
    totalAmount += amount
    return { itemId: item.itemId, qty: parseFloat(item.qty), rate: parseFloat(item.rate), amount }
  })

  const purchase = await prisma.purchase.create({
    data: {
      poNo, supplierId, totalAmount, notes,
      status: 'ORDERED',
      items: { create: processedItems },
    },
    include: { supplier: true, items: { include: { item: true } } },
  })

  return NextResponse.json(purchase, { status: 201 })
}
