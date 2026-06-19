import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { leadId, bumpIds, mainProductId } = data

    if (!leadId) {
      return NextResponse.json({ error: 'leadId é obrigatório' }, { status: 400 })
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Buscar o preço do produto principal selecionado (combos de 1 a 4 figurinhas)
    let totalCents = 1290
    const mainProduct = await db.product.findUnique({
      where: { id: mainProductId || 'main-sticker-1' }
    })
    if (mainProduct) {
      totalCents = mainProduct.priceCents
    }

    const selectedBumpsList: any[] = []

    if (bumpIds && Array.isArray(bumpIds) && bumpIds.length > 0) {
      // Buscar os bumps selecionados no banco
      const products = await db.product.findMany({
        where: {
          id: { in: bumpIds },
          type: 'BUMP'
        }
      })

      for (const prod of products) {
        totalCents += prod.priceCents
        selectedBumpsList.push({
          id: prod.id,
          name: prod.name,
          priceCents: prod.priceCents
        })
      }
    }

    // Criar o pedido com status PENDING_GENERATION
    const order = await db.order.create({
      data: {
        leadId: lead.id,
        status: 'PENDING_GENERATION',
        totalCents,
        selectedBumps: JSON.stringify(selectedBumpsList),
        paymentStatus: 'PENDING',
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor: ' + error.message }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  // Retorna todos os pedidos (útil para verificação admin)
  try {
    const orders = await db.order.findMany({
      include: { lead: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
