import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPaymentProvider } from '@/services/payments'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { orderId, email, name, cpf, phone } = data

    if (!orderId || !email || !name) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { lead: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Atualiza status do pedido
    await db.order.update({
      where: { id: orderId },
      data: { status: 'CHECKOUT_STARTED' }
    })

    const paymentProvider = getPaymentProvider()
    const session = await paymentProvider.createPaymentSession(
      orderId,
      email,
      order.totalCents,
      `Figurinha Personalizada Copa 2026 - ${order.lead.name}`
    )

    // Atualizar pedido com informações de checkout
    await db.order.update({
      where: { id: orderId },
      data: {
        checkoutUrl: session.checkoutUrl,
        paymentId: session.paymentId,
        paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
        paymentStatus: 'PENDING_PAYMENT'
      }
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.checkoutUrl,
      pixQrCode: session.pixQrCode,
      pixCopyPaste: session.pixCopyPaste,
      totalCents: order.totalCents
    })
  } catch (error: any) {
    console.error('Erro no checkout create:', error)
    return NextResponse.json({ error: 'Erro interno ao processar checkout: ' + error.message }, { status: 500 })
  }
}
