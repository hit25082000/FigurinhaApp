import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/services/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar limites
    const maxSizeBytes = 8 * 1024 * 1024 // 8MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'Arquivo excede limite de 8MB' }, { status: 400 })
    }

    // Validar mime types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato não permitido. Use JPG, PNG ou WEBP' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Gerar nome único
    const fileExt = file.name.split('.').pop() || 'jpeg'
    const fileName = `craque_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`

    const storageProvider = getStorageProvider()
    const photoUrl = await storageProvider.uploadFile(buffer, fileName, file.type)

    return NextResponse.json({ success: true, photoUrl })
  } catch (error: any) {
    console.error('Erro no upload da foto:', error)
    return NextResponse.json({ error: 'Erro interno ao processar upload: ' + error.message }, { status: 500 })
  }
}
