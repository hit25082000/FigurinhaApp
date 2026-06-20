'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ObrigadoRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const orderId = searchParams.get('src') || searchParams.get('orderId') || searchParams.get('order_id')
    if (orderId) {
      router.replace(`/obrigado/${orderId}`)
    } else {
      // Se não houver pedido, redireciona para a página inicial
      router.replace('/')
    }
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-t-copa-blue border-white rounded-full animate-spin" />
        <span className="text-xs font-bold text-copa-blue-dark uppercase tracking-widest">Carregando seu pedido...</span>
      </div>
    </main>
  )
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-t-copa-blue border-white rounded-full animate-spin" />
          <span className="text-xs font-bold text-copa-blue-dark uppercase tracking-widest">Processando...</span>
        </div>
      </main>
    }>
      <ObrigadoRedirect />
    </Suspense>
  )
}
