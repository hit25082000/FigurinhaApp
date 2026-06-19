import React from 'react'

interface WizardCardProps {
  children: React.ReactNode
}

export function WizardCard({ children }: WizardCardProps) {
  return (
    <div className="w-full bg-white rounded-[28px] border-4 border-copa-blue shadow-[6px_6px_0px_#12317A] p-6 sm:p-8 flex flex-col text-copa-black">
      {children}
    </div>
  )
}
export default WizardCard
