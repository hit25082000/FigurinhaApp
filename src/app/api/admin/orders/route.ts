import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const password = authHeader?.split(' ')[1] || req.headers.get('x-admin-password')

  const adminPass = process.env.ADMIN_PASSWORD || 'admin_craque_2026'

  if (password !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const orders = await db.order.findMany({
      include: { lead: true },
      orderBy: { createdAt: 'desc' }
    })

    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const paymentEvents = await db.paymentEvent.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Parse bumps
    const formattedOrders = orders.map(order => {
      let parsedBumps: any[] = []
      if (order.selectedBumps) {
        try {
          parsedBumps = JSON.parse(order.selectedBumps as string)
        } catch (e) {
          // ignore
        }
      }
      return {
        ...order,
        selectedBumps: parsedBumps
      }
    })

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      leads,
      paymentEvents
    })
  } catch (error: any) {
    console.error('Erro na API admin:', error)
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 })
  }
}
