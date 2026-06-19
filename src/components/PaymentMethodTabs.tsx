import React from 'react'

interface PaymentMethodTabsProps {
  activeTab: 'pix' | 'card'
  onChange: (tab: 'pix' | 'card') => void
}

export function PaymentMethodTabs({ activeTab, onChange }: PaymentMethodTabsProps) {
  return (
    <div className="flex border-2 border-copa-blue rounded-xl overflow-hidden mb-4">
      {/* Pix Tab */}
      <button
        type="button"
        onClick={() => onChange('pix')}
        className={`flex-1 py-3.5 text-center font-bold text-sm uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
          activeTab === 'pix'
            ? 'bg-copa-blue text-white shadow-inner'
            : 'bg-white text-copa-blue hover:bg-copa-gray'
        }`}
      >
        <span>⚡</span> Pix Instantâneo
      </button>

      {/* Credit Card Tab */}
      <button
        type="button"
        onClick={() => onChange('card')}
        className={`flex-1 py-3.5 text-center font-bold text-sm uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
          activeTab === 'card'
            ? 'bg-copa-blue text-white shadow-inner'
            : 'bg-white text-copa-blue hover:bg-copa-gray'
        }`}
      >
        <span>💳</span> Cartão de Crédito
      </button>
    </div>
  )
}
export default PaymentMethodTabs
