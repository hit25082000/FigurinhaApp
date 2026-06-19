'use client'

import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WizardCard from '@/components/WizardCard'
import StickerPreview from '@/components/StickerPreview'
import PriceBlock from '@/components/PriceBlock'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'

export default function ResultadoStickerPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const { orderId } = use(params)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const text = `Olha que linda ficou a figurinha personalizada do nosso craque! 😍 Dá pra ver a prévia e criar a sua grátis aqui: ${window.location.origin}`
      setShareUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`)
    }
  }, [])

  const handlePurchase = () => {
    // Redirecionar para a página de checkout
    router.push(`/checkout/${orderId}`)
  }

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center px-4 py-8 justify-center">
      <div className="w-full max-w-[430px]">
        {/* Card Principal */}
        <WizardCard>
          {/* Preview da Figurinha */}
          <StickerPreview orderId={orderId} showWatermark={true} />

          {/* Preço e Botão */}
          <PriceBlock priceCents={1290} onPurchase={handlePurchase} />

          {/* Botão de Compartilhar WhatsApp (CRO Viral) */}
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20BA56] active:scale-95 text-white font-bold text-sm py-4 rounded-xl border-2 border-green-700 shadow-[3px_3px_0px_#15803d] transition-all uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer mt-4"
              style={{ fontFamily: 'var(--font-titulo)' }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.794.002-2.615-1.012-5.074-2.859-6.923C16.378 2.039 13.924.996 11.312.996 5.904.996 1.505 5.392 1.502 10.793c-.001 1.52.41 3.01 1.192 4.3l-.994 3.635 3.72-.977c1.232.728 2.506 1.096 3.627 1.096z"/>
              </svg>
              🟢 Compartilhar no WhatsApp
            </a>
          )}

          {/* Depoimentos WhatsApp */}
          <TestimonialsCarousel />
        </WizardCard>
      </div>
    </main>
  )
}
