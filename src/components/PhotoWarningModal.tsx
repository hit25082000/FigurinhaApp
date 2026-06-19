import React from 'react'
import Image from 'next/image'

interface PhotoWarningModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PhotoWarningModal({ isOpen, onClose }: PhotoWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[360px] bg-white border-4 border-copa-blue rounded-[28px] shadow-[8px_8px_0px_#12317A] overflow-hidden p-6 text-center animate-scale-up">
        {/* Title */}
        <h3
          className="text-3xl font-bold text-copa-blue uppercase mb-4 tracking-wider"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          AVISO
        </h3>

        {/* Photo Reference Box */}
        <div className="bg-copa-blue-dark rounded-2xl p-3 mb-4 border-2 border-copa-blue">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden">
            <Image
              src="/photo-example.png"
              alt="Exemplo de foto correta: somente o rosto da pessoa"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Caption text */}
        <p className="text-sm font-semibold text-copa-blue-dark mb-6 leading-relaxed">
          A foto precisa ser{' '}
          <strong className="font-extrabold" style={{ fontFamily: 'var(--font-titulo)' }}>
            somente da pessoa
          </strong>
          , sem outras pessoas no enquadramento.
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-xl py-4 rounded-2xl border-2 border-copa-blue-dark shadow-[4px_4px_0px_#12317A] transition-all uppercase tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          ENTENDI
        </button>
      </div>
    </div>
  )
}
export default PhotoWarningModal
