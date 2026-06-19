import React from 'react'

interface ReviewDataCardProps {
  data: {
    name: string
    photoUrl: string
    club: string
    weightKg: string
    heightCm: string
    email: string
  }
  onSubmit: () => void
  onCorrect: () => void
}

export function ReviewDataCard({ data, onSubmit, onCorrect }: ReviewDataCardProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
          CONFIRA SEUS DADOS
        </h2>
        <p className="text-sm font-semibold text-copa-blue-dark mt-1">
          A figurinha será gerada em breve. Revise os dados abaixo com atenção.
        </p>
      </div>

      {/* Alerta */}
      <div className="bg-copa-red/10 border-2 border-copa-red rounded-2xl p-4 text-center">
        <p className="text-sm font-bold text-copa-red uppercase">
          ⚠️ ATENÇÃO!
        </p>
        <p className="text-xs font-semibold text-copa-blue-dark mt-0.5">
          Não fazemos alterações após a aprovação e pagamento.
        </p>
      </div>

      {/* Rosto Check Box */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-copa-blue bg-white shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
        <span className="text-[11px] font-bold text-copa-blue uppercase tracking-wider bg-copa-blue/10 px-3 py-1 rounded-full">
          👀 VERIFIQUE SE O ROSTO ESTÁ PRÓXIMO
        </span>
      </div>

      {/* Grid de Resumo */}
      <div className="bg-copa-gray rounded-2xl border-2 border-gray-200 p-4 flex flex-col gap-3 font-semibold text-sm text-copa-blue-dark">
        <div className="flex justify-between border-b border-gray-300/60 pb-2">
          <span className="opacity-70">NOME DO CRAQUE</span>
          <span className="font-bold text-copa-blue uppercase">{data.name}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300/60 pb-2">
          <span className="opacity-70">CLUBE DO CORAÇÃO</span>
          <span className="font-bold uppercase">{data.club}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300/60 pb-2">
          <span className="opacity-70">PESO</span>
          <span className="font-bold font-mono">{data.weightKg} KG</span>
        </div>
        <div className="flex justify-between border-b border-gray-300/60 pb-2">
          <span className="opacity-70">ALTURA</span>
          <span className="font-bold font-mono">{data.heightCm} CM</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">E-MAIL DE ENTREGA</span>
          <span className="font-bold text-xs lowercase">{data.email}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={onSubmit}
          type="button"
          className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-xl py-4 rounded-xl border-2 border-copa-blue-dark shadow-[4px_4px_0px_#12317A] transition-all uppercase tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          ENTENDI, GERAR FIGURINHA ⚽
        </button>
        <button
          onClick={onCorrect}
          type="button"
          className="w-full bg-white hover:bg-copa-gray active:scale-95 text-copa-blue font-bold text-base py-3 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] transition-all uppercase tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          CORRIGIR DADOS
        </button>
      </div>
    </div>
  )
}
export default ReviewDataCard
