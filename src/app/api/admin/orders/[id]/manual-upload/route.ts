import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStorageProvider } from '@/services/storage'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params
  
  const authHeader = req.headers.get('Authorization')
  const password = authHeader?.split(' ')[1] || req.headers.get('x-admin-password')
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_craque_2026'

  if (password !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload do arquivo final manual
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `manual_final_${orderId}_${Date.now()}.${fileExt}`
    
    const storageProvider = getStorageProvider()
    const finalUrl = await storageProvider.uploadFile(buffer, fileName, file.type)

    // Atualizar o pedido com a figurinha manual e definir o status como GENERATED ou DELIVERED se já pago
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        stickerUrl: finalUrl,
        status: order.paymentStatus === 'PAID' ? 'DELIVERED' : 'GENERATED'
      }
    })

    return NextResponse.json({ success: true, stickerUrl: finalUrl })
  } catch (error: any) {
    console.error('Erro no manual upload do admin:', error)
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 })
  }
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rota PUT para atualizar o status do pedido manualmente pelo admin
  const { id: orderId } = await params
  
  const authHeader = req.headers.get('Authorization')
  const password = authHeader?.split(' ')[1] || req.headers.get('x-admin-password')
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_craque_2026'

  if (password !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { status, paymentStatus } = await req.json()

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
