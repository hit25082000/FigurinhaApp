import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  try {
    // Carregar fonte esportiva
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'CBFHomeAway2026.ttf')
    const fontData = await fs.readFile(fontPath)

    // Carregar fonte manuscrita
    const fontHandPath = path.join(process.cwd(), 'public', 'fonts', 'SummerCrush.otf')
    const fontHandData = await fs.readFile(fontHandPath)

    let lead: any = null
    let isPaid = false

    if (orderId === 'exemplo') {
      lead = {
        name: 'LUIZ',
        birthDate: new Date('1999-01-25'),
        club: 'FLAMENGO',
        weightKg: 80,
        heightCm: 160,
        photoUrl: '/uploads/craque_1781717655962_unwg56.png'
      }
      isPaid = false
    } else {
      // Buscar pedido e dados do lead
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { lead: true }
      })

      if (!order) {
        return new NextResponse('Pedido não encontrado', { status: 404 })
      }

      lead = order.lead
      isPaid = order.status === 'PAID' || order.status === 'DELIVERED'

      // Se a foto já é uma figurinha gerada pela IA (template preenchido),
      // retornar diretamente (se pago) ou com marca d'água (se não pago).
      const photoUrl: string = lead?.photoUrl || ''
      const isAiGenerated = photoUrl.includes('ai_craque')

      if (isAiGenerated && photoUrl) {
        if (isPaid) {
          if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
            // URL externa (ex: Supabase) — fazer proxy para evitar CORS
            const upstream = await fetch(photoUrl)
            if (upstream.ok) {
              const buf = await upstream.arrayBuffer()
              const contentType = upstream.headers.get('content-type') || 'image/png'
              return new NextResponse(buf, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=86400',
                },
              })
            }
          } else {
            // Arquivo local em public/uploads
            const localPath = path.join(process.cwd(), 'public', photoUrl)
            try {
              const fileBuffer = await fs.readFile(localPath)
              return new NextResponse(fileBuffer, {
                headers: {
                  'Content-Type': 'image/png',
                  'Cache-Control': 'public, max-age=86400',
                },
              })
            } catch {
              // Fallback
            }
          }
        } else {
          // Não pago: aplicar marca d'água de prévia
          let aiPhotoBase64 = ''
          if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
            try {
              const upstream = await fetch(photoUrl)
              if (upstream.ok) {
                const arrayBuffer = await upstream.arrayBuffer()
                const contentType = upstream.headers.get('content-type') || 'image/png'
                const buffer = Buffer.from(arrayBuffer)
                aiPhotoBase64 = `data:${contentType};base64,${buffer.toString('base64')}`
              }
            } catch (e) {
              console.error('Erro ao baixar foto externa para marca dágua:', e)
            }
          } else {
            const localPath = path.join(process.cwd(), 'public', photoUrl)
            try {
              const fileBuffer = await fs.readFile(localPath)
              const ext = path.extname(photoUrl).replace('.', '')
              aiPhotoBase64 = `data:image/${ext || 'png'};base64,${fileBuffer.toString('base64')}`
            } catch (e) {
              console.error('Erro ao ler foto local para marca dágua:', e)
            }
          }

          if (aiPhotoBase64) {
            return new ImageResponse(
              (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aiPhotoBase64}
                    alt="Figurinha"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                  {/* Watermark Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        transform: 'rotate(-35deg)',
                        border: '8px solid rgba(217, 53, 85, 0.85)',
                        color: 'rgba(217, 53, 85, 0.85)',
                        fontSize: '64px',
                        fontFamily: 'CBFHomeAway2026',
                        fontWeight: 'bold',
                        padding: '10px 40px',
                        letterSpacing: '8px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      }}
                    >
                      PRÉVIA
                    </div>
                  </div>
                </div>
              ),
              {
                width: 400,
                height: 560,
                fonts: [
                  {
                    name: 'CBFHomeAway2026',
                    data: fontData,
                    style: 'normal',
                  }
                ]
              }
            )
          }
        }
      }
    }

    // Tratar imagem do lead
    let photoBase64 = ''
    if (lead.photoUrl) {
      if (lead.photoUrl.startsWith('/') || lead.photoUrl.startsWith('\\')) {
        const localPath = path.join(process.cwd(), 'public', lead.photoUrl)
        try {
          const fileBuffer = await fs.readFile(localPath)
          const ext = path.extname(lead.photoUrl).replace('.', '')
          photoBase64 = `data:image/${ext || 'jpeg'};base64,${fileBuffer.toString('base64')}`
        } catch (e) {
          console.error('Erro ao ler foto local:', e)
        }
      } else {
        // Se for url externa (ex. Supabase), tentar baixar
        try {
          const res = await fetch(lead.photoUrl)
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer()
            const contentType = res.headers.get('content-type') || 'image/jpeg'
            const buffer = Buffer.from(arrayBuffer)
            photoBase64 = `data:${contentType};base64,${buffer.toString('base64')}`
          }
        } catch (e) {
          console.error('Erro ao baixar foto externa:', e)
        }
      }
    }

    // Se falhar, usar uma imagem de avatar genérica
    if (!photoBase64) {
      photoBase64 = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200'
    }

    // Calcular idade
    let ageText = '--'
    if (lead.birthDate) {
      const birth = new Date(lead.birthDate)
      const diffMs = Date.now() - birth.getTime()
      const ageDate = new Date(diffMs)
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970)
      ageText = `${calculatedAge} ANOS`
    }

    const craqueName = lead.name.toUpperCase()
    const clubName = (lead.club || 'CRAQUE').toUpperCase()
    const heightText = lead.heightCm ? `${(lead.heightCm / 100).toFixed(2)} M` : '--'
    const weightText = lead.weightKg ? `${lead.weightKg} KG` : '--'

    // Retornar imagem utilizando ImageResponse
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFD400 0%, #E0B800 100%)',
            padding: '24px',
            boxSizing: 'border-box',
            border: '12px solid #1E3F95',
            borderRadius: '28px',
            position: 'relative',
          }}
        >
          {/* Card Border Inner */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              right: '4px',
              bottom: '4px',
              border: '4px solid #04A934',
              borderRadius: '16px',
              pointerEvents: 'none',
            }}
          />

          {/* Top Header Row */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {/* Rating & Position */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '48px', color: '#1E3F95', fontFamily: 'CBFHomeAway2026', lineHeight: 1 }}>99</span>
              <span style={{ fontSize: '14px', color: '#04A934', fontWeight: 'bold', fontFamily: 'CBFHomeAway2026' }}>CRAQUE</span>
            </div>

            {/* Country flag and code */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#12317A',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              {/* Flag SVG */}
              <svg width="24" height="16" viewBox="0 0 24 16" style={{ marginRight: '6px' }}>
                <rect width="24" height="16" fill="#04A934" />
                <polygon points="12,2 22,8 12,14 2,8" fill="#FFD400" />
                <circle cx="12" cy="8" r="3" fill="#1E3F95" />
              </svg>
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'CBFHomeAway2026' }}>BRA</span>
            </div>
          </div>

          {/* Photo Frame Container */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '210px',
              height: '210px',
              borderRadius: '50%',
              border: '6px solid #1E3F95',
              overflow: 'hidden',
              background: 'radial-gradient(circle, #04A934 0%, #12317A 100%)',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }}
          >
            {/* User Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoBase64}
              alt="Craque"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />

            {/* Custom Genérica Soccer Jersey Overlay at the bottom */}
            <svg
              viewBox="0 0 100 100"
              style={{
                position: 'absolute',
                bottom: '-25px',
                width: '160px',
                height: '110px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {/* Sleeves */}
              <path d="M 10 55 L 25 35 L 35 45 L 25 65 Z" fill="#FFD400" stroke="#04A934" strokeWidth="2" />
              <path d="M 90 55 L 75 35 L 65 45 L 75 65 Z" fill="#FFD400" stroke="#04A934" strokeWidth="2" />
              {/* Green sleeve ends */}
              <path d="M 10 55 L 25 65" stroke="#04A934" strokeWidth="6" />
              <path d="M 90 55 L 75 65" stroke="#04A934" strokeWidth="6" />
              
              {/* Jersey Body */}
              <path d="M 25 35 L 75 35 L 75 100 L 25 100 Z" fill="#FFD400" stroke="#04A934" strokeWidth="2" />
              {/* Collar Green */}
              <path d="M 40 35 Q 50 48 60 35" fill="#04A934" />
              {/* Brazilian Flag Emblem on chest */}
              <circle cx="38" cy="48" r="4" fill="#1E3F95" />
              <polygon points="38,45 41,48 38,51 35,48" fill="#FFD400" />
            </svg>
          </div>

          {/* Craque Name */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              background: '#1E3F95',
              padding: '6px 12px',
              borderRadius: '12px',
              transform: 'rotate(-2deg)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: '26px',
                color: '#FFFFFF',
                fontFamily: 'CBFHomeAway2026',
                textAlign: 'center',
                letterSpacing: '1px',
              }}
            >
              {craqueName}
            </span>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '3px solid #1E3F95',
              borderRadius: '16px',
              padding: '10px',
              boxSizing: 'border-box',
              zIndex: 10,
            }}
          >
            {/* Club Name */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                borderBottom: '2px dashed #1E3F95',
                paddingBottom: '6px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  color: '#1E3F95',
                  fontFamily: 'CBFHomeAway2026',
                  textAlign: 'center',
                }}
              >
                ⚽ {clubName}
              </span>
            </div>

            {/* Grid fields */}
            <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
              {/* Age */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', color: '#12317A', fontWeight: 'bold' }}>IDADE</span>
                <span style={{ fontSize: '13px', color: '#1E3F95', fontFamily: 'CBFHomeAway2026' }}>{ageText}</span>
              </div>
              {/* Altura */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', color: '#12317A', fontWeight: 'bold' }}>ALTURA</span>
                <span style={{ fontSize: '13px', color: '#1E3F95', fontFamily: 'CBFHomeAway2026' }}>{heightText}</span>
              </div>
              {/* Peso */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: '#12317A', fontWeight: 'bold' }}>PESO</span>
                <span style={{ fontSize: '13px', color: '#1E3F95', fontFamily: 'CBFHomeAway2026' }}>{weightText}</span>
              </div>
              {/* Edição */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: '#12317A', fontWeight: 'bold' }}>EDIÇÃO</span>
                <span style={{ fontSize: '12px', color: '#04A934', fontFamily: 'CBFHomeAway2026' }}>COPA 2026</span>
              </div>
            </div>
          </div>

          {/* Footer Watermark / Brand */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: '#12317A', fontWeight: 'bold', letterSpacing: '2px' }}>
              ★ MINHA FIGURINHA COPA 2026 ★
            </span>
          </div>

          {/* Diagonal Watermark if NOT paid */}
          {!isPaid && (
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '28px',
                zIndex: 100,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  transform: 'rotate(-35deg)',
                  border: '8px solid rgba(217, 53, 85, 0.85)',
                  color: 'rgba(217, 53, 85, 0.85)',
                  fontSize: '64px',
                  fontFamily: 'CBFHomeAway2026',
                  fontWeight: 'bold',
                  padding: '10px 40px',
                  letterSpacing: '8px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                PRÉVIA
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 400,
        height: 560,
        fonts: [
          {
            name: 'CBFHomeAway2026',
            data: fontData,
            style: 'normal',
          },
          {
            name: 'SummerCrush',
            data: fontHandData,
            style: 'normal',
          }
        ]
      }
    )
  } catch (error) {
    console.error('Erro ao gerar imagem da figurinha:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
}
