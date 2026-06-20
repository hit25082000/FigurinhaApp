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
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handlePurchase = async () => {
    setIsRedirecting(true)
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Erro ao iniciar checkout')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erro ao iniciar checkout')
      setIsRedirecting(false)
    }
  }

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center px-4 py-8 justify-center">
      <div className="w-full max-w-[430px]">
        {/* Card Principal */}
        <WizardCard>
          {/* Preview da Figurinha */}
          <StickerPreview orderId={orderId} showWatermark={true} />

          {/* Preço e Botão */}
          <PriceBlock priceCents={1290} onPurchase={handlePurchase} isLoading={isRedirecting} />

          {/* Depoimentos WhatsApp */}
          <TestimonialsCarousel />
        </WizardCard>
      </div>
    </main>
  )
}
