'use client'

import React, { useState } from 'react'

const testimonialImages = [
  '/assets/Depoimentos/02de0fab-26e5-43e6-a2ba-7f05cd88979a.png',
  '/assets/Depoimentos/31d6161d-e83e-4fc0-acda-5953b2970b6d.png',
  '/assets/Depoimentos/649438da-76d7-4a29-8d3e-113e2c98ddf0.png',
  '/assets/Depoimentos/73c6257f-7abc-4041-ab51-b457554efba9.png',
  '/assets/Depoimentos/a2e8117e-a955-4688-bd3c-d095779ad8a7.png',
  '/assets/Depoimentos/a67c917a-2171-43e1-899d-6bf816d300d3.png',
  '/assets/Depoimentos/a882f501-b1fa-4212-b4c9-88e8ce3ae755.png',
  '/assets/Depoimentos/c74b3c87-27ef-447d-978f-e29e8442b722.png',
  '/assets/Depoimentos/c74b3c87-27ef-447d-978f-e29e8442b722-2.png',
]

export function PreSaleTestimonials() {
  const [index, setIndex] = useState(0)

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonialImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setIndex((prev) => (prev === testimonialImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <h3
        className="text-2xl font-bold text-copa-blue uppercase mb-5 tracking-widest text-center"
        style={{ fontFamily: 'var(--font-titulo)' }}
      >
        DEPOIMENTO DE CLIENTES:
      </h3>

      {/* Testimonial Card */}
      <div className="w-full max-w-[340px] relative rounded-[28px] overflow-hidden border-4 border-copa-blue shadow-[6px_6px_0px_#12317A] bg-white group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={testimonialImages[index]}
          alt={`Depoimento de Cliente ${index + 1}`}
          className="w-full aspect-[4/4.5] object-cover transition-opacity duration-300"
        />

        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-copa-blue hover:bg-copa-blue-dark text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-lg cursor-pointer transition-transform active:scale-90 select-none z-10"
        >
          ‹
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-copa-blue hover:bg-copa-blue-dark text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-lg cursor-pointer transition-transform active:scale-90 select-none z-10"
        >
          ›
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {testimonialImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            type="button"
            className={`h-3 w-3 rounded-full transition-all border border-copa-blue/50 ${
              i === index ? 'bg-copa-blue w-6' : 'bg-gray-400/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default PreSaleTestimonials
