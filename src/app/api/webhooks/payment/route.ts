import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEmailService } from '@/services/emails'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { orderId, status, paymentProvider, paymentId } = payload

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

    const isPaid = status === 'PAID' || status === 'approved' || status === 'succeeded'

    if (isPaid) {
      // Registrar evento de pagamento no banco
      await db.paymentEvent.create({
        data: {
          orderId,
          provider: paymentProvider || 'mock',
          eventType: 'payment.success',
          rawPayload: JSON.stringify(payload),
        }
      })

      // Atualizar status do pedido para PAID e DELIVERED
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentId: paymentId || order.paymentId,
        }
      })

      // Disparar envio de e-mail de entrega (mock)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const emailService = getEmailService()
      await emailService.sendDeliveryEmail(
        order.lead.email,
        order.lead.name,
        `${appUrl}/api/sticker-image/${orderId}`,
        `${appUrl}/api/sticker-pdf/${orderId}`
      )

      // Atualizar status final para DELIVERED
      await db.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' }
      })
    } else {
      // Registrar falha ou pendente
      await db.paymentEvent.create({
        data: {
          orderId,
          provider: paymentProvider || 'mock',
          eventType: 'payment.failed',
          rawPayload: JSON.stringify(payload),
        }
      })

      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED',
          paymentStatus: 'FAILED'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no webhook de pagamento:', error)
    return NextResponse.json({ error: 'Erro interno no webhook: ' + error.message }, { status: 500 })
  }
}
