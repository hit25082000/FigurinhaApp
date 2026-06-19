import React, { useEffect, useState } from 'react'

interface LoadingPhotoScreenProps {
  photoUrl: string
  onComplete: () => void
}

const phrases = [
  'Esse tem cara de jogador caro hein',
  'Calma, estamos analisando o craque',
  'Essa figurinha promete',
  'Preparando o álbum...',
]

export function LoadingPhotoScreen({ photoUrl, onComplete }: LoadingPhotoScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    // Rotacionar frases a cada 800ms
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 800)

    // Incrementar barra de progresso fake (de 0% a 100% em 3 segundos)
    const totalDuration = 3000 // 3 segundos
    const stepTime = 30 // atualiza a cada 30ms
    const totalSteps = totalDuration / stepTime
    const increment = 100 / totalSteps

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(progressInterval)
          clearInterval(phraseInterval)
          setTimeout(onComplete, 200) // atraso de conclusão confortável
          return 100
        }
        return next
      })
    }, stepTime)

    return () => {
      clearInterval(phraseInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <div className="w-full flex flex-col items-center py-6 text-center text-copa-blue-dark">
      {/* Title */}
      <h2
        className="text-3xl font-bold uppercase mb-6 tracking-wider animate-pulse"
        style={{ fontFamily: 'var(--font-titulo)' }}
      >
        CARREGANDO FOTO
      </h2>

      {/* Circle Photo Preview with spinning rings */}
      <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
        {/* Double animated spinning rings */}
        <div className="absolute inset-0 border-4 border-dashed border-copa-blue rounded-full animate-spin duration-3000" />
        <div className="absolute inset-2 border-4 border-dashed border-t-copa-yellow border-copa-green rounded-full animate-reverse-spin duration-2000" />

        {/* Photo Container */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-copa-blue bg-white shadow-lg z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Craque" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Fun Phrases */}
      <div className="min-h-[48px] px-4 mb-6 flex items-center justify-center">
        <p className="text-lg font-bold text-copa-blue animate-fade-in transition-all duration-300 italic" style={{ fontFamily: 'var(--font-papernotes)' }}>
          {phrases[phraseIndex]}
        </p>
      </div>

      {/* Progress Value */}
      <span className="text-xl font-bold font-mono mb-2">
        {Math.round(progress)}%
      </span>

      {/* Progress Bar Container */}
      <div className="w-full max-w-[300px] h-4 bg-white border-2 border-copa-blue rounded-full overflow-hidden shadow-[2px_2px_0px_#1E3F95]">
        <div
          className="h-full bg-copa-green transition-all duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
export default LoadingPhotoScreen
