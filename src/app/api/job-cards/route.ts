import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = {}
  if (status) where.status = status
  if (clientId) where.clientId = clientId

  const [jobs, total] = await Promise.all([
    prisma.jobCard.findMany({
      where,
      include: { client: true, jobType: true, operator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobCard.count({ where }),
  ])

  return NextResponse.json({ jobs, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    clientId, jobTypeId, description, qty, size, colors, paper,
    instructions, operatorId, dueDate, rate, gstPct = 18,
  } = body

  if (!clientId || !jobTypeId || !description || !qty) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const count = await prisma.jobCard.count()
  const jobNo = `JC-${year}-${String(count + 1).padStart(4, '0')}`

  const amount = parseFloat(rate || 0) * parseInt(qty)
  const gstAmount = (amount * gstPct) / 100
  const totalAmount = amount + gstAmount

  const job = await prisma.jobCard.create({
    data: {
      jobNo, clientId, jobTypeId, description,
      qty: parseInt(qty), size, colors, paper, instructions,
      operatorId: operatorId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      rate: parseFloat(rate || 0), amount, gstPct, gstAmount, totalAmount,
      status: 'RECEIVED',
    },
    include: { client: true, jobType: true },
  })

  return NextResponse.json(job, { status: 201 })
}
