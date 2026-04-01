import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quotations = await prisma.quotation.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(quotations)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clientId, description, qty, rate, gstPct = 18, validTill, notes } = body

  if (!clientId || !description || !qty || !rate) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const count = await prisma.quotation.count()
  const qtNo = `QT-${year}-${String(count + 1).padStart(4, '0')}`

  const amount = parseFloat(rate) * parseInt(qty)
  const gstAmount = (amount * parseFloat(gstPct)) / 100
  const totalAmount = amount + gstAmount

  const quotation = await prisma.quotation.create({
    data: {
      qtNo, clientId, description,
      qty: parseInt(qty), rate: parseFloat(rate),
      amount, gstPct: parseFloat(gstPct), gstAmount, totalAmount,
      validTill: new Date(validTill), notes,
      status: 'PENDING',
    },
    include: { client: true },
  })

  return NextResponse.json(quotation, { status: 201 })
}
