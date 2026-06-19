import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { lead: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Fazer parse dos bumps do SQLite (salvos como string JSON)
    let parsedBumps: any[] = []
    if (order.selectedBumps) {
      try {
        parsedBumps = JSON.parse(order.selectedBumps as string)
      } catch (e) {
        console.error('Erro ao fazer parse de bumps:', e)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        selectedBumps: parsedBumps
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor: ' + error.message }, { status: 500 })
  }
}
