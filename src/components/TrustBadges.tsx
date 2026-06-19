import React from 'react'

export function TrustBadges() {
  return (
    <div className="w-full flex flex-col items-center text-center my-6 px-4 bg-copa-yellow p-4 rounded-3xl border-2 border-copa-blue-dark/10 shadow-sm relative overflow-hidden select-none">
      
      {/* Principal grid: Lock, Text, Envelope */}
      <div className="grid grid-cols-12 gap-2 w-full items-center mb-4">
        
        {/* Lock / Compra Segura (Left) */}
        <div className="col-span-3 flex flex-col items-center gap-1">
          <svg className="w-12 h-12 text-copa-blue" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5ZM12 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-black text-copa-blue-dark leading-tight uppercase tracking-wider">
            Compra<br />Segura
          </span>
        </div>

        {/* Text Center (Middle) */}
        <div className="col-span-6 flex flex-col gap-0.5 uppercase justify-center leading-none">
          <span className="text-xs font-black text-copa-blue-dark tracking-wider">O acesso chega</span>
          <span className="text-3xl font-black text-copa-blue" style={{ fontFamily: 'var(--font-titulo)' }}>
            IMEDIATAMENTE
          </span>
          <span className="text-xs font-black text-copa-blue-dark tracking-wider">no seu</span>
          <span className="text-4xl font-black text-copa-blue" style={{ fontFamily: 'var(--font-titulo)' }}>
            E-MAIL
          </span>
          <span className="text-sm font-black text-copa-blue-dark tracking-wide mt-0.5">após a compra</span>
          <span className="text-[9px] lowercase font-bold text-gray-600 normal-case mt-1.5 leading-tight">
            Verifique sua caixa de entrada e spam!
          </span>
        </div>

        {/* Envelope / Instantâneo (Right) */}
        <div className="col-span-3 flex flex-col items-center gap-1">
          <div className="relative">
            <svg className="w-12 h-12 text-copa-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-copa-yellow font-black text-xl translate-y-[-2px] select-none">
              ⚡
            </span>
          </div>
          <span className="text-[9px] font-black text-copa-blue-dark leading-tight uppercase tracking-wider">
            Acesso<br />Instantâneo
          </span>
        </div>

      </div>

      {/* Garantia (Bottom) */}
      <div className="w-full flex items-center justify-center gap-2 border-t border-copa-blue/10 pt-3.5 mt-1 bg-white/45 p-2 rounded-2xl">
        <svg className="w-6 h-6 text-copa-blue shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM12 4.5a7.5 7.5 0 0 0-7.5 7.5.75.75 0 0 1-1.5 0A9 9 0 0 1 12 3a9 9 0 0 1 9 9 .75.75 0 0 1-1.5 0 7.5 7.5 0 0 0-7.5-7.5Zm0 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 1.5a6 6 0 0 0-5.356 3.29.75.75 0 0 0 .668 1.085h9.376a.75.75 0 0 0 .668-1.086A6 6 0 0 0 12 15Z" clipRule="evenodd" />
          <path d="M11.645 20.91a.75.75 0 0 1 .105-1.05 4.5 4.5 0 0 0 1.5-3.36.75.75 0 0 1 1.5 0 6 6 0 0 1-2.055 4.515.75.75 0 0 1-1.05-.105Z" />
          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 4.5c4.14 0 7.5 3.36 7.5 7.5s-3.36 7.5-7.5 7.5-7.5-3.36-7.5-7.5 3.36-7.5 7.5-7.5Z" />
        </svg>
        <span className="text-[10px] font-black text-copa-blue-dark uppercase tracking-wider">
          Garantia de 100% de satisfação
        </span>
      </div>
    </div>
  )
}

export default TrustBadges

