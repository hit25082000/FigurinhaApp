import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEmailService } from '@/services/emails'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const password = authHeader?.split(' ')[1] || req.headers.get('x-admin-password')
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_craque_2026'

  if (password !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { lead: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailService = getEmailService()
    
    // Dispara e-mail
    await emailService.sendDeliveryEmail(
      order.lead.email,
      order.lead.name,
      `${appUrl}/api/sticker-image/${orderId}`,
      `${appUrl}/api/sticker-pdf/${orderId}`
    )

    return NextResponse.json({ success: true, message: 'E-mail enviado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao reenviar e-mail:', error)
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 })
  }
}
