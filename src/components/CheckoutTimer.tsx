import React, { useEffect, useState } from 'react'

export function CheckoutTimer() {
  // 10 minutos = 600 segundos
  const [seconds, setSeconds] = useState(600)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Reinicia para manter o senso de urgência
          return 600
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full bg-copa-red text-white py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md uppercase tracking-wider animate-pulse">
      <span className="text-lg">⏱</span>
      <span>{formatTime(seconds)}</span>
      <span className="opacity-90">A figurinha será excluída em breve.</span>
    </div>
  )
}
export default CheckoutTimer
