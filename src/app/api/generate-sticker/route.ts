import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAIStickerImage } from '@/services/kie'

// Aumenta o timeout para 5 minutos (limite da Vercel Hobby)
export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { orderId } = data

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

    const lead = order.lead
    if (!lead || !lead.photoUrl) {
      return NextResponse.json({ error: 'Foto do craque não encontrada para este pedido' }, { status: 400 })
    }

    // Atualiza status para GENERATING
    await db.order.update({
      where: { id: orderId },
      data: { status: 'GENERATING' }
    })

    // Chamar Kie AI para gerar a imagem estilizada da figurinha
    let finalPhotoUrl = lead.photoUrl
    try {
      finalPhotoUrl = await generateAIStickerImage(lead.photoUrl, {
        name: lead.name,
        birthDate: lead.birthDate,
        club: lead.club,
        weightKg: lead.weightKg,
        heightCm: lead.heightCm,
      })
      
      // Atualizar o Lead com a nova URL da foto gerada pela IA
      await db.lead.update({
        where: { id: lead.id },
        data: { photoUrl: finalPhotoUrl }
      })
      console.log(`[generate-sticker] IA gerou com sucesso para lead ${lead.id}. URL: ${finalPhotoUrl}`)
    } catch (apiError: any) {
      console.error(`[generate-sticker] ERRO AO GERAR COM KIE AI para lead ${lead.id}:`, apiError?.message || apiError)
      console.error('[generate-sticker] Usando foto original como fallback. A figurinha mostrara a foto sem transformacao IA.')
      // Fallback: mantém a foto original para não quebrar a experiência do usuário
    }

    // Atualiza status para GENERATED e define caminhos locais
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await db.order.update({
      where: { id: orderId },
      data: {
        status: 'GENERATED',
        stickerUrl: `${appUrl}/api/sticker-image/${orderId}`,
        stickerPdfUrl: `${appUrl}/api/sticker-pdf/${orderId}`,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao gerar figurinha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor: ' + error.message }, { status: 500 })
  }
}
