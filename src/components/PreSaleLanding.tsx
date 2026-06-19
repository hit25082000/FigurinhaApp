'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TESTIMONIAL_IMAGES = [
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

const FIGURINHA_IMAGES = [
  { src: '/assets/figurinha-helena.png', alt: 'Figurinha Helena' },
  { src: '/assets/figurinha-miguel.png', alt: 'Figurinha Miguel' },
  { src: '/assets/figurinha-arthur.png', alt: 'Figurinha Arthur' },
]

// ── Generic Carousel Component ──────────────────────────────────────────────
interface CarouselProps {
  items: React.ReactNode[]
  id: string
}

function Carousel({ items, id, interval = 3000 }: CarouselProps & { interval?: number }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isDragging = useRef(false)

  const total = items.length

  const prev = useCallback(() => {
    setIndex(i => (i - 1 + total) % total)
  }, [total])

  const next = useCallback(() => {
    setIndex(i => (i + 1) % total)
  }, [total])

  // ── Auto-play ──────────────────────────────────────────
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % total)
    }, interval)
    return () => clearInterval(timer)
  }, [paused, total, interval])

  // Get the 3 indices to show (wrapping)
  const getVisibleIndices = () => {
    return [0, 1, 2].map(offset => (index + offset) % total)
  }

  const visibleIndices = getVisibleIndices()

  // Touch / swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = false
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy)) isDragging.current = true
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
    isDragging.current = false
  }

  return (
    <div
      className="carousel-root"
      id={id}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arrow + Track row */}
      <div className="carousel-row">
        {/* Prev button */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="carousel-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Cards */}
        <div
          className="carousel-track"
          onTouchStart={(e) => { setPaused(true); onTouchStart(e) }}
          onTouchMove={onTouchMove}
          onTouchEnd={(e) => { onTouchEnd(e); setTimeout(() => setPaused(false), 2500) }}
        >
          {visibleIndices.map((itemIdx, slot) => (
            <div
              key={`${id}-${itemIdx}-${slot}`}
              className={`carousel-card ${slot === 1 ? 'carousel-card--center' : 'carousel-card--side'}`}
            >
              {items[itemIdx]}
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          aria-label="Próximo"
          className="carousel-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir para item ${i + 1}`}
            className={`carousel-dot ${i === index ? 'carousel-dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PreSaleLanding() {
  const testimonialItems = TESTIMONIAL_IMAGES.map((src, i) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={i}
      src={src}
      alt={`Depoimento de cliente ${i + 1}`}
      className="testimonial-img"
      draggable={false}
      loading="lazy"
    />
  ))

  const figurinhaItems = FIGURINHA_IMAGES.map((item, i) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={i}
      src={item.src}
      alt={item.alt}
      className="figurinha-img"
      draggable={false}
      loading="lazy"
    />
  ))

  return (
    <main className="flex flex-col items-center min-h-screen bg-copa-yellow">
      <section className="flex flex-col items-center w-full py-8 text-center">

        {/* ── Hero ── */}
        <div className="flex flex-col items-center justify-between w-full min-h-[100dvh] px-5">

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-3 max-w-2xl"
            style={{ fontFamily: 'var(--font-titulo)' }}
          >
            Transforme seu filho em uma{' '}
            <span className="text-copa-blue">figurinha personalizada</span>{' '}
            da Copa do Mundo
          </h1>

          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-copa-blue shadow-md mb-2">
            <span className="text-copa-yellow text-base leading-none">★</span>
            <span
              className="text-sm sm:text-base font-bold text-copa-white tracking-wide"
              style={{ fontFamily: 'var(--font-papernotes)' }}
            >
              +25.000 figurinhas já criadas
            </span>
          </div>

          {/* Three-sticker hero fan */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-[400px] mb-2 select-none">
            {/* Left card — Helena */}
            <div
              className="absolute left-0 top-6 md:top-8 w-36 h-52 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-xl z-10"
              style={{ transform: 'rotate(-8deg)', animation: 'wiggle 4s ease-in-out infinite', '--wiggle-rot': '-8deg' } as React.CSSProperties}
            >
              <Image
                src="/assets/hero-helena.png"
                alt="Figurinha Helena"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 144px, 192px"
              />
              <div className="shine-effect" />
            </div>

            {/* Center card — Miguel (frontmost) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-44 h-64 md:w-60 md:h-[340px] rounded-xl overflow-hidden shadow-2xl z-30"
              style={{ animation: 'wiggle 4s ease-in-out infinite 0.5s', '--wiggle-rot': '0deg' } as React.CSSProperties}
            >
              <Image
                src="/assets/hero-miguel.png"
                alt="Figurinha Miguel"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 176px, 240px"
              />
              <div className="shine-effect" style={{ animationDelay: '1s' }} />
            </div>

            {/* Right card — Arthur */}
            <div
              className="absolute right-0 top-6 md:top-8 w-36 h-52 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-xl z-10"
              style={{ transform: 'rotate(8deg)', animation: 'wiggle 4s ease-in-out infinite 1s', '--wiggle-rot': '8deg' } as React.CSSProperties}
            >
              <Image
                src="/assets/hero-arthur.png"
                alt="Figurinha Arthur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 144px, 192px"
              />
              <div className="shine-effect" style={{ animationDelay: '2s' }} />
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl max-w-md mb-4 leading-relaxed"
            style={{ fontFamily: 'var(--font-papernotes)' }}
          >
            Responda algumas perguntas rápidas e veja como criar uma figurinha
            exclusiva, com o nome, foto e estilo do seu pequeno craque.
          </p>

          {/* CTA Button */}
          <Link
            href="/criar"
            id="cta-iniciar"
            className="w-full max-w-md bg-copa-blue text-copa-white font-bold text-2xl md:text-3xl py-5 rounded-2xl shadow-lg hover:bg-copa-blue-dark active:scale-95 transition-all duration-200 animate-pulse-glow cursor-pointer tracking-[0.15em] text-center"
            style={{ fontFamily: 'var(--font-titulo)' }}
          >
            INICIAR
          </Link>
        </div>

        {/* ── VSL Section ── */}
        <div className="w-full max-w-2xl px-5 mt-16 flex flex-col items-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-copa-blue mb-4 tracking-wide text-center uppercase"
            style={{ fontFamily: 'var(--font-titulo)' }}
          >
            Veja o Vídeo Explicativo
          </h2>
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-copa-blue bg-copa-blue-dark relative">
            <video
              src="/assets/vsl-curta.mp4"
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>
        </div>

        {/* ── Social proof carousels ── */}
        <div className="w-full mt-12 flex flex-col gap-12 pb-12 max-w-4xl mx-auto px-4">

          {/* Testimonials carousel */}
          <div className="w-full">
            <h2
              className="text-xl sm:text-2xl font-bold text-copa-blue mb-6 tracking-wide"
              style={{ fontFamily: 'var(--font-titulo)' }}
            >
              O que as famílias estão dizendo
            </h2>
            <Carousel items={testimonialItems} id="carousel-testimonials" interval={3000} />
          </div>

          {/* Figurinhas carousel */}
          <div className="w-full">
            <h2
              className="text-xl sm:text-2xl font-bold text-copa-blue mb-6 tracking-wide"
              style={{ fontFamily: 'var(--font-titulo)' }}
            >
              Figurinhas criadas por outras famílias
            </h2>
            <Carousel items={figurinhaItems} id="carousel-figurinhas" interval={2500} />
          </div>
        </div>

      </section>
    </main>
  )
}
