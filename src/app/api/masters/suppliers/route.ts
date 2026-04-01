import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, contact, email, address, gstNo, items } = body
  if (!name || !contact) return NextResponse.json({ error: 'name and contact required' }, { status: 400 })
  const count = await prisma.supplier.count()
  const code = `SUP${String(count + 1).padStart(3, '0')}`
  const supplier = await prisma.supplier.create({ data: { code, name, contact, email, address, gstNo, items } })
  return NextResponse.json(supplier, { status: 201 })
}
