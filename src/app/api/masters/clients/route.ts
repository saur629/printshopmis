import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, contact, email, address, city, gstNo, creditLimit } = body

  if (!name || !contact) {
    return NextResponse.json({ error: 'name and contact required' }, { status: 400 })
  }

  const count = await prisma.client.count()
  const code = `CLT${String(count + 1).padStart(3, '0')}`

  const client = await prisma.client.create({
    data: { code, name, contact, email, address, city, gstNo, creditLimit: parseFloat(creditLimit || 0) },
  })

  return NextResponse.json(client, { status: 201 })
}
