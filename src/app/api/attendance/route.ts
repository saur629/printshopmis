import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const month = searchParams.get('month') // YYYY-MM
  const date = searchParams.get('date')   // YYYY-MM-DD

  const where: any = {}
  if (userId) where.userId = userId
  if (date) {
    const d = new Date(date)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.date = { gte: d, lt: next }
  } else if (month) {
    const [year, mon] = month.split('-').map(Number)
    where.date = {
      gte: new Date(year, mon - 1, 1),
      lt: new Date(year, mon, 1),
    }
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(attendance)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { userId, date, checkIn, checkOut, status, notes } = body

  if (!userId || !date || !status) {
    return NextResponse.json({ error: 'userId, date, status required' }, { status: 400 })
  }

  const att = await prisma.attendance.upsert({
    where: { userId_date: { userId, date: new Date(date) } },
    update: { checkIn, checkOut, status, notes },
    create: { userId, date: new Date(date), checkIn, checkOut, status, notes },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json(att, { status: 201 })
}
