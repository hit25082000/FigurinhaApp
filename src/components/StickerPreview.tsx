import React from 'react'

interface StickerPreviewProps {
  orderId: string
  showWatermark?: boolean
}

export function StickerPreview({ orderId, showWatermark = true }: StickerPreviewProps) {
  // O endpoint /api/sticker-image gera a figurinha dinamicamente com/sem marca d'água
  const stickerUrl = `/api/sticker-image/${orderId}`

  return (
    <div className="flex flex-col items-center w-full">
      {/* Container da Figurinha com brilho dourado e bordas esportivas */}
      <div className="relative w-full max-w-[280px] aspect-[5/7] rounded-[24px] overflow-hidden border-4 border-copa-blue shadow-[8px_8px_0px_#12317A] bg-white group transition-all duration-300 hover:scale-[1.02] hover:shadow-[10px_10px_0px_#12317A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stickerUrl}
          alt="Sua Figurinha Copa 2026"
          className="w-full h-full object-cover"
        />

        {/* Efeito de Brilho Metálico Passando */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
      </div>

      {/* Indicador de Status */}
      <span className="text-[10px] font-bold text-copa-blue uppercase mt-3 tracking-widest bg-copa-blue/10 px-3 py-1 rounded-full">
        ⚽ Figurinha Gerada com Inteligência Artificial
      </span>
    </div>
  )
}
export default StickerPreview
