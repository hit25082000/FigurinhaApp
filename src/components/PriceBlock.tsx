import React from 'react'

interface PriceBlockProps {
  priceCents: number
  onPurchase: () => void
  isLoading?: boolean
}

export function PriceBlock({ priceCents, onPurchase, isLoading }: PriceBlockProps) {
  const formattedPrice = (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <div className="w-full flex flex-col items-center text-center mt-6">
      {/* Título Ganhador */}
      <h2
        className="text-5xl font-bold text-copa-blue uppercase leading-none"
        style={{ fontFamily: 'var(--font-titulo)' }}
      >
        GOLLL!
      </h2>
      <h3 className="text-xl font-bold text-copa-blue-dark mt-1">
        Sua figurinha está pronta!
      </h3>
      <p className="text-xs font-semibold text-copa-blue-dark max-w-sm mt-3 px-2 leading-relaxed">
        Receba o arquivo digital para impressão e participe do sorteio. Leia o regulamento em seu e-mail.
      </p>

      {/* Preço verde destacado */}
      <div className="my-5 flex flex-col items-center">
        <span className="text-sm font-bold text-gray-500 line-through">De R$ 29,90</span>
        <span
          className="text-5xl font-extrabold text-copa-green tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          {formattedPrice}
        </span>
        <span className="text-[10px] font-bold text-copa-green uppercase mt-1 tracking-widest bg-copa-green/10 px-2 py-0.5 rounded-full">
          Preço Único Promocional
        </span>
      </div>

      {/* Botão de Compra Agressivo */}
      <button
        onClick={onPurchase}
        type="button"
        disabled={isLoading}
        className="w-full max-w-md bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-2xl py-5 rounded-2xl border-2 border-copa-blue-dark shadow-[4px_4px_0px_#12317A] transition-all uppercase tracking-widest animate-pulse-glow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
        style={{ fontFamily: 'var(--font-titulo)' }}
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
            Redirecionando...
          </>
        ) : (
          'RECEBER MINHA FIGURINHA'
        )}
      </button>

      {/* Info liberação imediata */}
      <p className="text-xs font-bold text-copa-blue-dark mt-4 flex items-center gap-1.5 px-2">
        <span>✅</span> ACESSO LIBERADO NA HORA
      </p>
      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
        É só voltar aqui em Minha Área após o pagamento.
      </p>
    </div>
  )
}
export default PriceBlock
