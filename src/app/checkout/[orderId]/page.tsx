'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import CheckoutTimer from '@/components/CheckoutTimer'
import TrustBadges from '@/components/TrustBadges'
import WizardCard from '@/components/WizardCard'
import CheckoutForm from '@/components/CheckoutForm'
import RecentPurchasesPopup from '@/components/RecentPurchasesPopup'

const AVAILABLE_BUMPS = [
  {
    id: 'bump-pdf-pack',
    name: 'Pacote figurinha COPA 2026 - PDF IMPRESSÃO',
    description: 'Deixe a experiência ainda mais incrível com o PDF do pacotinho oficial da copa do mundo 2026.',
    priceCents: 490,
  },
  {
    id: 'bump-poster-a2',
    name: 'Poste A2 Figurinha Personalizada - PDF IMPRESSÃO',
    description: 'Decore sua casa com um belo pôster da sua figurinha personalizada tamanho A2.',
    priceCents: 790,
  },
  {
    id: 'bump-brazil-selection',
    name: 'Figurinhas da Seleção Brasileira 2026 - PDF Impressão',
    description: 'Todas as figurinhas para a impressão, complete ela com um clique.',
    priceCents: 1390,
  },
  {
    id: 'bump-draw-chances',
    name: 'Sorteio de MIL REAIS - Aumente suas chances',
    description: 'Aumente suas chances no sorteio do dia 11/06/2026.',
    priceCents: 1492,
  },
  {
    id: 'bump-neymar-edition',
    name: 'Edição Especial: Figurinha do Neymar - Camisa da Seleção',
    description: 'Adquira a figurinha do fenômeno brasileiro.',
    priceCents: 590,
  },
]

export default function CheckoutStickerPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const { orderId } = use(params)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        if (res.ok) {
          setOrderInfo(data.order)
        }
      } catch (err) {
        console.error('Erro ao buscar dados do pedido:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const handleSubmitSuccess = (targetOrderId: string) => {
    // Redirecionar para página de obrigado
    router.push(`/obrigado/${targetOrderId}`)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-t-copa-blue border-white rounded-full animate-spin" />
          <span className="text-xs font-bold text-copa-blue-dark uppercase tracking-widest">Carregando Checkout...</span>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-copa-yellow flex flex-col">
      {/* Barra superior de urgência */}
      <CheckoutTimer />

      {/* Prova Social Flutuante (Escassez) */}
      <RecentPurchasesPopup />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[430px]">
          {/* Confiança Badges */}
          <TrustBadges />

          {/* Form Box */}
          <WizardCard>
            <CheckoutForm
              orderId={orderId}
              mainPriceCents={1290}
              availableBumps={AVAILABLE_BUMPS}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </WizardCard>
        </div>
      </main>
    </div>
  )
}
