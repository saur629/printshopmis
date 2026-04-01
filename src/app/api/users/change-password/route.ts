import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { userId, currentPassword, newPassword, forceChange } = body

  const sessionUser = session.user as any
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(sessionUser.role)
  const targetUserId = forceChange && isAdmin ? userId : sessionUser.id

  if (!targetUserId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Verify current password if changing own password
  if (!forceChange || targetUserId === sessionUser.id) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: targetUserId }, data: { password: hashed } })

  return NextResponse.json({ success: true, message: 'Password changed successfully' })
}