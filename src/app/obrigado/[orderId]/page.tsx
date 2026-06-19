'use client'

import React, { useEffect, useState, use } from 'react'
import WizardCard from '@/components/WizardCard'
import StickerPreview from '@/components/StickerPreview'

export default function ObrigadoPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
    // Poll de status do pagamento a cada 5 segundos se estiver pendente
    const interval = setInterval(() => {
      if (order && order.status !== 'PAID' && order.status !== 'DELIVERED') {
        fetchOrderDetails()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [orderId, order?.status])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-t-copa-blue border-white rounded-full animate-spin" />
          <span className="text-xs font-bold text-copa-blue-dark uppercase tracking-widest">Verificando pagamento...</span>
        </div>
      </main>
    )
  }

  const isApproved = order?.status === 'PAID' || order?.status === 'DELIVERED'

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">
        <WizardCard>
          {isApproved ? (
            <div className="w-full flex flex-col items-center text-center gap-5">
              {/* Header de Sucesso */}
              <div>
                <span className="text-4xl">🎉</span>
                <h2
                  className="text-3xl font-extrabold text-copa-green uppercase mt-2 leading-none"
                  style={{ fontFamily: 'var(--font-titulo)' }}
                >
                  PAGAMENTO APROVADO!
                </h2>
                <p className="text-sm font-bold text-copa-blue-dark mt-1">
                  Sua figurinha foi liberada.
                </p>
              </div>

              {/* Preview da Figurinha Sem Marca D'Água */}
              <StickerPreview orderId={orderId} showWatermark={false} />

              {/* Botões de Download */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <a
                  href={`/api/sticker-image/${orderId}`}
                  download={`figurinha-copa-2026-${orderId}.png`}
                  className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-base py-4 rounded-xl border-2 border-copa-blue-dark shadow-[3px_3px_0px_#12317A] transition-all uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
                  style={{ fontFamily: 'var(--font-titulo)' }}
                >
                  📥 Baixar Figurinha (PNG)
                </a>
                <a
                  href={`/api/sticker-pdf/${orderId}`}
                  download={`figurinha-copa-2026-${orderId}.pdf`}
                  className="w-full bg-copa-green hover:bg-green-700 active:scale-95 text-white font-bold text-base py-4 rounded-xl border-2 border-green-800 shadow-[3px_3px_0px_#04A934] transition-all uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
                  style={{ fontFamily: 'var(--font-titulo)' }}
                >
                  📄 Baixar PDF Para Impressão
                </a>
              </div>

              {/* Mensagem e-mail */}
              <div className="bg-copa-blue/10 border border-copa-blue/20 rounded-xl p-3 w-full text-xs font-semibold text-copa-blue-dark">
                📬 Também enviamos os links de download para o seu e-mail: <strong className="select-all">{order?.lead?.email}</strong>.
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center text-center py-6 gap-4 text-copa-blue-dark">
              <span className="text-5xl animate-bounce">⏳</span>
              <h2
                className="text-2xl font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-titulo)' }}
              >
                AGUARDANDO PAGAMENTO
              </h2>
              <p className="text-sm font-semibold max-w-xs leading-relaxed">
                Estamos aguardando a confirmação do pagamento pelo banco. Isso costuma levar alguns segundos.
              </p>

              <button
                onClick={fetchOrderDetails}
                type="button"
                className="mt-4 bg-white hover:bg-copa-gray active:scale-95 text-copa-blue font-bold text-sm py-3 px-6 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] uppercase tracking-wide transition-all cursor-pointer"
              >
                🔄 Verificar Novamente
              </button>
            </div>
          )}
        </WizardCard>
      </div>
    </main>
  )
}
