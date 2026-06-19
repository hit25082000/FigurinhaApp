import React from 'react'

interface SummaryItem {
  name: string
  priceCents: number
}

interface OrderSummaryProps {
  mainProductPriceCents: number
  selectedBumps: SummaryItem[]
  totalCents: number
}

export function OrderSummary({ mainProductPriceCents, selectedBumps, totalCents }: OrderSummaryProps) {
  const format = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div className="w-full bg-copa-gray border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 font-semibold text-xs text-copa-blue-dark">
      <h3 className="text-sm font-bold uppercase border-b border-gray-300 pb-2 mb-1">
        Resumo da Compra
      </h3>

      {/* Main product */}
      <div className="flex justify-between">
        <span className="opacity-70">Figurinha Copa 2026 (Arquivo Digital)</span>
        <span className="font-mono">{format(mainProductPriceCents)}</span>
      </div>

      {/* Selected Bumps */}
      {selectedBumps.map((bump, index) => (
        <div key={index} className="flex justify-between text-copa-green">
          <span className="opacity-75 font-medium flex items-center gap-1">
            <span>+</span> {bump.name}
          </span>
          <span className="font-mono">{format(bump.priceCents)}</span>
        </div>
      ))}

      {/* Total row */}
      <div className="flex justify-between items-center border-t border-gray-300 pt-2.5 mt-2 text-sm">
        <span className="font-bold uppercase text-copa-blue">Total a pagar:</span>
        <span className="text-xl font-extrabold text-copa-green font-mono">
          {format(totalCents)}
        </span>
      </div>
    </div>
  )
}
export default OrderSummary
