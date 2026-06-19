import React from 'react'

interface BumpProduct {
  id: string
  name: string
  description: string
  priceCents: number
}

interface OrderBumpCardProps {
  product: BumpProduct
  isSelected: boolean
  onToggle: () => void
}

export function OrderBumpCard({ product, isSelected, onToggle }: OrderBumpCardProps) {
  const formattedPrice = (product.priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <div
      onClick={onToggle}
      className={`w-full border-2 border-dashed rounded-2xl p-4 flex gap-3 cursor-pointer select-none transition-all duration-200 ${
        isSelected
          ? 'border-copa-green bg-copa-green/5 shadow-sm'
          : 'border-copa-red bg-copa-red/5 hover:bg-copa-red/[0.08]'
      }`}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-0.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // Lógica tratada no onClick do container
          className={`h-5 w-5 rounded border-2 cursor-pointer transition-all ${
            isSelected
              ? 'bg-copa-green border-copa-green text-white'
              : 'border-copa-red bg-white'
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-xs font-bold text-copa-blue-dark uppercase leading-snug">
            {product.name}
          </h4>
          <span className="text-sm font-extrabold text-copa-green font-mono shrink-0">
            +{formattedPrice}
          </span>
        </div>
        
        {product.description && (
          <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Highlight badge */}
        <span className={`text-[8px] font-extrabold uppercase mt-2 self-start px-2 py-0.5 rounded ${
          isSelected ? 'bg-copa-green text-white' : 'bg-copa-red text-white'
        }`}>
          {isSelected ? '✓ Adicionado' : '⚡ Levar também'}
        </span>
      </div>
    </div>
  )
}
export default OrderBumpCard
