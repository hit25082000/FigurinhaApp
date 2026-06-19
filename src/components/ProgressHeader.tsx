import React from 'react'

interface ProgressHeaderProps {
  step: number // 1 a 4
}

export function ProgressHeader({ step }: ProgressHeaderProps) {
  const percentage = (step / 5) * 100

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-bold text-copa-blue uppercase tracking-widest">
          Passo {step} de 5
        </span>
        <span className="text-xs font-bold text-copa-blue">
          {Math.round(percentage)}% Concluído
        </span>
      </div>
      <div className="w-full h-3 bg-white border-2 border-copa-blue rounded-full overflow-hidden shadow-[2px_2px_0px_#1E3F95]">
        <div
          className="h-full bg-copa-blue transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
export default ProgressHeader
