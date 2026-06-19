import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { lead: true }
    })

    if (!order) {
      return new NextResponse('Pedido não encontrado', { status: 404 })
    }

    // Gerar a URL absoluta para obter a imagem da figurinha
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const imageUrl = `${appUrl}/api/sticker-image/${orderId}`

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Falha ao obter imagem da figurinha: ${imageResponse.statusText}`)
    }

    const imageBytes = await imageResponse.arrayBuffer()

    // Criar documento PDF A4 (595.276 x 841.890 pontos)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.276, 841.890])
    const { width, height } = page.getSize()

    // Incorporar a imagem PNG no PDF
    const stickerImage = await pdfDoc.embedPng(imageBytes)

    // Redimensionar figurinha no PDF (cerca de 8.5cm x 12cm)
    const stickerWidth = 241 // 8.5 cm em pontos (1cm ≈ 28.35 pt)
    const stickerHeight = 338 // 12 cm em pontos

    const stickerX = (width - stickerWidth) / 2
    const stickerY = (height - stickerHeight) / 2

    // Desenhar linhas guia/corte tracejadas ao redor da figurinha
    const borderOffset = 5
    page.drawRectangle({
      x: stickerX - borderOffset,
      y: stickerY - borderOffset,
      width: stickerWidth + borderOffset * 2,
      height: stickerHeight + borderOffset * 2,
      borderColor: undefined,
      borderWidth: 1,
      // Usar cor cinza clara para a linha de corte
      color: undefined,
      opacity: 0.5,
    })

    // Desenhar a figurinha
    page.drawImage(stickerImage, {
      x: stickerX,
      y: stickerY,
      width: stickerWidth,
      height: stickerHeight,
    })

    // Adicionar marcações e texto instrucional simples
    // Usar fonte padrão Courier/Helvetica
    const font = await pdfDoc.embedFont('Helvetica-Bold')
    const fontRegular = await pdfDoc.embedFont('Helvetica')

    const titleText = 'MINHA FIGURINHA COPA 2026'
    const subtitleText = `Figurinha Oficial Digital de ${order.lead.name.toUpperCase()}`
    const instructionsTitle = 'INSTRUCOES DE IMPRESSAO:'
    const instructions1 = '- Imprima em papel fotografico adesivo brilhante de 135g a 180g para melhor qualidade.';
    const instructions2 = '- Certifique-se de configurar a escala de impressao para 100% (Tamanho Real).';
    const instructions3 = '- Recorte nas linhas guia utilizando uma tesoura ou estilete com regua.';
    
    // Escrever Título
    page.drawText(titleText, {
      x: (width - font.widthOfTextAtSize(titleText, 16)) / 2,
      y: height - 100,
      size: 16,
      font,
      color: undefined, // default preto
    })

    // Escrever Subtítulo
    page.drawText(subtitleText, {
      x: (width - fontRegular.widthOfTextAtSize(subtitleText, 12)) / 2,
      y: height - 120,
      size: 12,
      font: fontRegular,
    })

    // Escrever Instruções
    page.drawText(instructionsTitle, {
      x: 60,
      y: 140,
      size: 11,
      font,
    })

    page.drawText(instructions1, {
      x: 60,
      y: 115,
      size: 9,
      font: fontRegular,
    })

    page.drawText(instructions2, {
      x: 60,
      y: 95,
      size: 9,
      font: fontRegular,
    })

    page.drawText(instructions3, {
      x: 60,
      y: 75,
      size: 9,
      font: fontRegular,
    })

    // Desenhar linha tracejada decorativa para as instruções
    page.drawLine({
      start: { x: 50, y: 155 },
      end: { x: width - 50, y: 155 },
      thickness: 1,
      opacity: 0.3,
    })

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="figurinha-copa-2026-${orderId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF da figurinha:', error)
    return new NextResponse('Erro interno do servidor ao gerar PDF', { status: 500 })
  }
}
