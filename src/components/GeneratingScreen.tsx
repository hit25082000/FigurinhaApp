import React, { useEffect, useState } from 'react'

interface GeneratingScreenProps {
  orderId: string
  onComplete: () => void
}

export function GeneratingScreen({ orderId, onComplete }: GeneratingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isApiDone, setIsApiDone] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    // Chamar API de geração de figurinha (a Kie AI pode levar até 2 minutos)
    const generateSticker = async () => {
      try {
        const res = await fetch('/api/generate-sticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
          // Timeout generoso para aguardar a Kie AI processar (modelo com 2 imagens leva até 6 min)
          signal: AbortSignal.timeout(390_000), // 6min30s
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Erro na geração')
        }
        setIsApiDone(true)
      } catch (err: any) {
        console.error('[GeneratingScreen] Erro ao gerar figurinha:', err)
        setApiError('Não foi possível gerar automaticamente. Prossiga para o checkout e nossa equipe gerará manualmente no painel admin!')
        setIsApiDone(true) // Permite concluir mesmo se der erro (com fallback manual no admin)
      }
    }

    generateSticker()
  }, [orderId])

  useEffect(() => {
    // Progresso simulado que avança devagar (simulando os ~60-120s da IA)
    // Trava em 98% até a API concluir, depois completa para 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          // Segura no 98% enquanto API ainda está rodando
          return 98
        }
        // Avança ~0.5% a cada 900ms = chega em 98% em ~3 minutos
        return Math.min(prev + 0.5, 98)
      })
    }, 900)

    return () => clearInterval(interval)
  }, [])

  // Efeito separado: quando API termina, finaliza a barra e redireciona
  useEffect(() => {
    if (!isApiDone) return
    setProgress(100)
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [isApiDone, onComplete])

  return (
    <div className="w-full flex flex-col items-center text-center">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
          GERANDO SUA FIGURINHA
        </h2>
        <p className="text-sm font-semibold text-copa-blue-dark mt-1">
          Não saia dessa tela, leva até 3 minutos.
        </p>
      </div>

      {/* VSL / Bloco de Vídeo Simulador */}
      <div className="w-full aspect-video bg-copa-blue-dark rounded-2xl border-4 border-copa-blue shadow-lg overflow-hidden flex flex-col items-center justify-center p-4 relative mb-4">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80')]" />
        
        {/* Play Icon Layer */}
        <div className="z-10 bg-white/10 hover:bg-white/20 p-4 rounded-full border border-white/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center mb-3">
          <span className="text-3xl text-copa-yellow">▶</span>
        </div>

        <div className="z-10 text-white flex flex-col gap-1 px-4 leading-normal font-bold">
          <span className="text-xs uppercase tracking-widest text-copa-yellow">Você já começou a assistir esse vídeo</span>
          <div className="flex gap-4 justify-center mt-2 text-xs uppercase">
            <button type="button" className="bg-copa-blue hover:bg-copa-blue-dark py-2 px-4 rounded-lg border border-white/40 cursor-pointer">
              Continuar assistindo?
            </button>
            <button type="button" className="bg-white/15 hover:bg-white/25 py-2 px-3 rounded-lg border border-white/20 cursor-pointer">
              Assistir do início?
            </button>
          </div>
        </div>
      </div>

      {/* Box de Vantagens e Prêmios */}
      <div className="bg-white border-2 border-copa-blue rounded-2xl p-4 shadow-md w-full mb-6 text-copa-blue-dark">
        <p className="text-sm font-semibold leading-relaxed">
          Adquira sua figurinha <strong className="text-copa-blue uppercase">HOJE</strong> e concorra a
        </p>
        <p className="text-3xl font-bold text-copa-green my-1" style={{ fontFamily: 'var(--font-titulo)' }}>
          MIL REAIS
        </p>
        <p className="text-xs font-semibold leading-relaxed">
          no dia 11/06/2026 (início dos jogos) <br />
          + <strong className="text-copa-blue">MAIS MIL REAIS</strong> no dia da FINAL! 🏆
        </p>
      </div>

      {/* Progress Value & Bar */}
      <div className="w-full flex flex-col items-center">
        <span className="text-lg font-bold font-mono text-copa-blue-dark mb-1">
          {Math.round(progress)}%
        </span>
        <div className="w-full h-4 bg-white border-2 border-copa-blue rounded-full overflow-hidden shadow-[2px_2px_0px_#1E3F95]">
          <div
            className="h-full bg-copa-green transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {apiError && (
          <p className="text-xs font-bold text-copa-red mt-4 bg-copa-red/5 p-3 rounded-xl border border-copa-red/25">
            ⚠️ {apiError}
          </p>
        )}
      </div>
    </div>
  )
}
export default GeneratingScreen
