import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function sendTwilioSMS(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from || accountSid.startsWith('ACxxx')) {
    console.log(`[SMS Mock] To: ${to} | Message: ${body}`)
    return { sid: 'mock-' + Date.now(), status: 'sent' }
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })

  if (!resp.ok) throw new Error(`Twilio error: ${resp.status}`)
  return resp.json()
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [logs, templates] = await Promise.all([
    prisma.smsLog.findMany({ orderBy: { sentAt: 'desc' }, take: 50 }),
    prisma.smsTemplate.findMany({ where: { active: true } }),
  ])

  return NextResponse.json({ logs, templates })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clientId, mobile, message, template } = body

  if (!mobile || !message) {
    return NextResponse.json({ error: 'mobile and message required' }, { status: 400 })
  }

  try {
    await sendTwilioSMS(mobile, message)

    const log = await prisma.smsLog.create({
      data: { clientId: clientId || null, mobile, message, template, status: 'SENT' },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (err: any) {
    const log = await prisma.smsLog.create({
      data: { clientId: clientId || null, mobile, message, template, status: 'FAILED' },
    })
    return NextResponse.json({ error: err.message, log }, { status: 500 })
  }
}
