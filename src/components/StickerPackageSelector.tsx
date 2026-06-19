import React from 'react'

export interface StickerPackage {
  id: string
  name: string
  description: string
  priceCents: number
  originalPriceCents: number
  badge?: string
  badgeColor?: string
  savingsText?: string
}

const PACKAGES: StickerPackage[] = [
  {
    id: 'main-sticker-1',
    name: '1 Figurinha Personalizada',
    description: 'Apenas figurinha personalizada do seu craque.',
    priceCents: 1290,
    originalPriceCents: 1290,
  },
  {
    id: 'main-sticker-2',
    name: 'Combo Duplo (Leve 2)',
    description: 'Perfeito para irmãos ou presentear os avós!',
    priceCents: 1990,
    originalPriceCents: 2580,
    badge: 'Mais Vendido 🏆',
    badgeColor: 'bg-copa-green',
    savingsText: 'Economize R$ 5,90',
  },
  {
    id: 'main-sticker-3',
    name: 'Combo Triplo (Leve 3)',
    description: 'Crie figurinhas para toda a família!',
    priceCents: 2490,
    originalPriceCents: 3870,
    badge: 'Super Desconto ⚡',
    badgeColor: 'bg-copa-blue',
    savingsText: 'Economize R$ 13,80',
  },
  {
    id: 'main-sticker-4',
    name: 'Combo Família (Leve 4)',
    description: 'O melhor valor unitário para completar o álbum!',
    priceCents: 2990,
    originalPriceCents: 5160,
    badge: 'Melhor Valor 🔥',
    badgeColor: 'bg-copa-red',
    savingsText: 'Economize R$ 21,70',
  },
]

interface StickerPackageSelectorProps {
  selectedId: string
  onChange: (id: string, priceCents: number) => void
}

export function StickerPackageSelector({ selectedId, onChange }: StickerPackageSelectorProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <h3 className="text-xs font-bold text-copa-blue uppercase tracking-widest border-b pb-1">
        📦 Escolha a quantidade de Figurinhas
      </h3>
      
      <div className="flex flex-col gap-2.5">
        {PACKAGES.map((pkg) => {
          const isSelected = selectedId === pkg.id
          
          return (
            <div
              key={pkg.id}
              onClick={() => onChange(pkg.id, pkg.priceCents)}
              className={`relative w-full border-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all duration-200 ${
                isSelected
                  ? 'border-copa-blue bg-copa-blue/5 shadow-sm scale-[1.01]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Radio Indicator */}
              <div className="flex items-center justify-center shrink-0">
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-copa-blue bg-copa-blue' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white animate-scale-up" />}
                </div>
              </div>

              {/* Package Details */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-copa-blue-dark uppercase">
                    {pkg.name}
                  </span>
                  
                  {pkg.badge && (
                    <span className={`text-[8px] font-extrabold uppercase text-white px-2 py-0.5 rounded-full ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-snug">
                  {pkg.description}
                </span>

                {pkg.savingsText && (
                  <span className="text-[9px] font-bold text-copa-green uppercase mt-1">
                    ✓ {pkg.savingsText}
                  </span>
                )}
              </div>

              {/* Pricing Display */}
              <div className="flex flex-col items-end justify-center shrink-0 pl-2">
                {pkg.originalPriceCents > pkg.priceCents && (
                  <span className="text-[10px] text-gray-400 line-through font-mono font-semibold">
                    {formatPrice(pkg.originalPriceCents)}
                  </span>
                )}
                <span className={`text-base font-extrabold font-mono leading-none ${isSelected ? 'text-copa-blue' : 'text-copa-green'}`}>
                  {formatPrice(pkg.priceCents)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StickerPackageSelector
