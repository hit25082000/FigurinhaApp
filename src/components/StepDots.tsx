import React from 'react'

interface StepDotsProps {
  currentStep: number // 1 a 4
}

export function StepDots({ currentStep }: StepDotsProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`h-3 w-3 rounded-full border border-copa-blue transition-all duration-200 ${
            s === currentStep
              ? 'bg-copa-blue w-6'
              : 'bg-white'
          }`}
        />
      ))}
    </div>
  )
}
export default StepDots
