import React, { useEffect, useState } from 'react'

interface PurchaseEvent {
  name: string
  location: string
  product: string
  timeAgo: string
}

const PURCHASE_POOL: PurchaseEvent[] = [
  { name: 'Ricardo S.', location: 'São Paulo - SP', product: 'Combo Duplo (2 Figurinhas)', timeAgo: 'há 12 segundos' },
  { name: 'Juliana M.', location: 'Rio de Janeiro - RJ', product: 'Combo Família (4 Figurinhas)', timeAgo: 'há 28 segundos' },
  { name: 'Felipe A.', location: 'Belo Horizonte - MG', product: '1 Figurinha Personalizada', timeAgo: 'há 1 minuto' },
  { name: 'Ana Carolina B.', location: 'Porto Alegre - RS', product: 'Combo Duplo (2 Figurinhas)', timeAgo: 'há 45 segundos' },
  { name: 'Gustavo K.', location: 'Curitiba - PR', product: 'Combo Triplo (3 Figurinhas)', timeAgo: 'há 2 minutos' },
  { name: 'Patrícia F.', location: 'Salvador - BA', product: 'Combo Família (4 Figurinhas)', timeAgo: 'há 15 segundos' },
  { name: 'Marcos R.', location: 'Campinas - SP', product: 'Combo Duplo (2 Figurinhas)', timeAgo: 'há 3 minutos' },
  { name: 'Sandra L.', location: 'Fortaleza - CE', product: '1 Figurinha Personalizada', timeAgo: 'há 1 minuto' },
  { name: 'Thiago D.', location: 'Goiânia - GO', product: 'Combo Duplo (2 Figurinhas)', timeAgo: 'há 50 segundos' },
  { name: 'Fernanda C.', location: 'Florianópolis - SC', product: 'Combo Triplo (3 Figurinhas)', timeAgo: 'há 12 segundos' },
]

export function RecentPurchasesPopup() {
  const [currentEvent, setCurrentEvent] = useState<PurchaseEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Primeiro popup após 4 segundos
    const initialTimeout = setTimeout(() => {
      showRandomEvent()
    }, 4000)

    // Ciclo a cada 14 segundos (4s visível, 10s oculto)
    const interval = setInterval(() => {
      showRandomEvent()
    }, 14000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  const showRandomEvent = () => {
    const randomIdx = Math.floor(Math.random() * PURCHASE_POOL.length)
    setCurrentEvent(PURCHASE_POOL[randomIdx])
    setIsVisible(true)

    // Esconde o popup após 5 segundos
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  if (!currentEvent) return null

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 bg-white border-2 border-copa-blue rounded-2xl p-3 shadow-xl flex items-center gap-3 max-w-[320px] transition-all duration-500 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      {/* Icon / Avatar container */}
      <div className="h-10 w-10 bg-copa-yellow/20 text-copa-blue flex items-center justify-center rounded-xl text-xl shrink-0">
        ⚡
      </div>

      {/* Info Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-1">
          <span className="text-[11px] font-extrabold text-copa-blue-dark truncate uppercase">
            {currentEvent.name} ({currentEvent.location})
          </span>
        </div>
        <span className="text-[10px] font-bold text-copa-green uppercase mt-0.5">
          Comprei: {currentEvent.product}
        </span>
        <span className="text-[9px] font-semibold text-gray-400 mt-0.5">
          Aprovado {currentEvent.timeAgo}
        </span>
      </div>

      {/* Green checkout validation dot */}
      <div className="h-2.5 w-2.5 rounded-full bg-copa-green shrink-0 animate-ping absolute top-2 right-2" />
      <div className="h-2 w-2 rounded-full bg-copa-green shrink-0 absolute top-2.5 right-2.5" />
    </div>
  )
}

export default RecentPurchasesPopup
