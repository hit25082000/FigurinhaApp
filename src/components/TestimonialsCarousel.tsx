import React, { useState } from 'react'

interface Testimonial {
  name: string
  time: string
  message: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Ana Paula (Mãe)',
    time: '14:32',
    message: 'sim ficou linda ❤️',
    avatar: '👩',
  },
  {
    name: 'Ricardo (Pai)',
    time: '18:15',
    message: 'já completou o album faltava essa ❤️',
    avatar: '👨',
  },
  {
    name: 'Arthur (Tio)',
    time: '09:41',
    message: 'meu filho amou kkk',
    avatar: '🧔',
  },
  {
    name: 'Helena (Mãe)',
    time: '21:04',
    message: 'ficou perfeita',
    avatar: '👩',
  },
]

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const current = testimonials[index]

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <h3
        className="text-lg font-bold text-copa-blue uppercase mb-4 tracking-wider"
        style={{ fontFamily: 'var(--font-titulo)' }}
      >
        DEPOIMENTO DE CLIENTES:
      </h3>

      {/* WhatsApp Styled Card */}
      <div className="w-full max-w-[340px] bg-[#E5DDD5] rounded-[24px] border-4 border-copa-blue shadow-[4px_4px_0px_#12317A] overflow-hidden flex flex-col relative aspect-[4/2.5]">
        {/* Chat header */}
        <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center gap-2.5 border-b border-[#054D44]">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl">
            {current.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">{current.name}</span>
            <span className="text-[9px] text-[#A6D3CC]">online</span>
          </div>
        </div>

        {/* Chat background pattern overlay (using absolute flex elements) */}
        <div className="flex-1 p-4 flex flex-col justify-end">
          {/* Chat bubble */}
          <div className="self-start max-w-[80%] bg-[#FFFFFF] rounded-2xl rounded-tl-none p-3 shadow-md border border-[#E0E0E0] relative flex flex-col">
            {/* Message */}
            <p className="text-xs font-semibold text-copa-black leading-snug">
              {current.message}
            </p>
            {/* Timestamp */}
            <span className="text-[8px] text-gray-400 font-bold self-end mt-1">
              {current.time}
            </span>
          </div>
        </div>

        {/* Left/Right Controls overlay */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-2 top-[55%] -translate-y-1/2 bg-white/80 hover:bg-white text-copa-blue h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg border border-copa-blue shadow cursor-pointer active:scale-90 select-none z-10"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-2 top-[55%] -translate-y-1/2 bg-white/80 hover:bg-white text-copa-blue h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg border border-copa-blue shadow cursor-pointer active:scale-90 select-none z-10"
        >
          ›
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            type="button"
            className={`h-2 w-2 rounded-full border border-copa-blue transition-all ${
              i === index ? 'bg-copa-blue w-4' : 'bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
export default TestimonialsCarousel
