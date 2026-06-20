import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEmailService } from '@/services/emails'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log('Received OnProfit webhook payload:', JSON.stringify(payload, null, 2))

    // Rastreamento: o orderId é passado no parâmetro 'src' na URL de checkout da OnProfit
    const orderId = 
      payload.src || 
      payload.orderId || 
      payload.external_reference ||
      payload.tracking?.src ||
      payload.utm_source ||
      (payload.custom_fields && payload.custom_fields.orderId)

    if (!orderId) {
      console.warn('OnProfit webhook: orderId/src não encontrado no payload')
      return NextResponse.json({ error: 'orderId (src) não encontrado no payload' }, { status: 400 })
    }

    // Buscar o pedido correspondente no banco
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { lead: true }
    })

    if (!order) {
      console.warn(`OnProfit webhook: Pedido com id ${orderId} não encontrado`)
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Status do pagamento na OnProfit/Kiwify:
    // costuma ser 'approved' ou 'paid' ou 'succeeded' ou 'completed' para vendas bem-sucedidas.
    const status = (payload.status || payload.order_status || payload.event || '').toLowerCase()
    
    const isPaid = 
      status === 'approved' || 
      status === 'paid' || 
      status === 'succeeded' || 
      status === 'completed' || 
      status.includes('approved') || 
      status.includes('success') ||
      status.includes('paid')

    const transactionId = payload.transaction_id || payload.payment_id || payload.id || `onprofit_${Date.now()}`

    if (isPaid) {
      // Registrar evento de pagamento no banco
      await db.paymentEvent.create({
        data: {
          orderId,
          provider: 'onprofit',
          eventType: 'payment.success',
          rawPayload: JSON.stringify(payload),
        }
      })

      // Atualizar status do pedido para PAID
      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentProvider: 'onprofit',
          paymentId: String(transactionId),
        }
      })

      // Obter bumps selecionados
      let selectedBumps: any[] = []
      if (order.selectedBumps) {
        try {
          selectedBumps = JSON.parse(order.selectedBumps as string)
        } catch (e) {
          console.error('Erro ao fazer parse dos bumps para o email:', e)
        }
      }

      // Enviar e-mail de entrega da figurinha
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const emailService = getEmailService()
      await emailService.sendDeliveryEmail(
        order.lead.email,
        order.lead.name,
        `${appUrl}/api/sticker-image/${orderId}`,
        `${appUrl}/api/sticker-pdf/${orderId}`,
        selectedBumps
      )

      // Atualizar status final para DELIVERED
      await db.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' }
      })

      console.log(`OnProfit Webhook: Pedido ${orderId} processado e enviado com sucesso por e-mail.`)
    } else {
      // Registrar evento com status não aprovado
      await db.paymentEvent.create({
        data: {
          orderId,
          provider: 'onprofit',
          eventType: `payment.status_${status}`,
          rawPayload: JSON.stringify(payload),
        }
      })

      console.log(`OnProfit Webhook: Pedido ${orderId} recebido com status pendente/não aprovado: ${status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no webhook OnProfit:', error)
    return NextResponse.json({ error: 'Erro interno no webhook: ' + error.message }, { status: 500 })
  }
}
