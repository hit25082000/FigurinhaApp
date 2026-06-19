'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import WizardCard from '@/components/WizardCard'

interface Order {
  id: string
  status: string
  totalCents: number
  createdAt: string
  stickerUrl: string | null
  stickerPdfUrl: string | null
  lead: {
    name: string
  }
}

export default function MinhaAreaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.')
      return
    }

    setIsLoading(true)
    try {
      // Obter pedidos associados a esse e-mail (usamos a rota de admin ou criamos uma consulta simples)
      const res = await fetch('/api/orders') // Rota de pedidos retorna tudo, filtramos localmente para simplificar
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao consultar pedidos')
      }

      const clientOrders = data.orders.filter(
        (o: any) => o.lead.email.toLowerCase() === email.toLowerCase().trim()
      )

      if (clientOrders.length === 0) {
        setError('Nenhum pedido encontrado para este e-mail. Verifique se digitou corretamente.')
      } else {
        setOrders(clientOrders)
        setIsLoggedIn(true)
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return { label: 'Pronto / Pago', color: 'bg-copa-green/10 text-copa-green' }
      case 'PENDING_GENERATION':
      case 'GENERATING':
        return { label: 'Gerando Figurinha', color: 'bg-copa-yellow/20 text-copa-blue-dark border border-copa-yellow/50' }
      case 'CHECKOUT_STARTED':
      case 'PAYMENT_PENDING':
        return { label: 'Aguardando Pagamento', color: 'bg-copa-red/10 text-copa-red' }
      default:
        return { label: 'Pendente', color: 'bg-gray-100 text-gray-500' }
    }
  }

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">
        <WizardCard>
          {!isLoggedIn ? (
            /* Formulário de Login */
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-5 text-copa-blue-dark">
              <div className="text-center">
                <span className="text-4xl">🔑</span>
                <h2
                  className="text-3xl font-extrabold uppercase mt-2 tracking-wider"
                  style={{ fontFamily: 'var(--font-titulo)' }}
                >
                  ÁREA DO CLIENTE
                </h2>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  Informe o e-mail cadastrado na compra para acessar suas figurinhas.
                </p>
              </div>

              {/* Campo E-mail */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-copa-blue uppercase px-1">Seu E-mail</label>
                <input
                  type="email"
                  placeholder="Ex: craque@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-copa-blue"
                />
                {error && (
                  <span className="text-xs font-bold text-copa-red px-1 mt-1">
                    ⚠️ {error}
                  </span>
                )}
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-lg py-4 rounded-xl border-2 border-copa-blue-dark shadow-[3px_3px_0px_#12317A] transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                style={{ fontFamily: 'var(--font-titulo)' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          ) : (
            /* Listagem de Pedidos */
            <div className="w-full flex flex-col gap-5 text-copa-blue-dark">
              <div className="text-center border-b pb-4">
                <span className="text-4xl">⚽</span>
                <h2
                  className="text-2xl font-extrabold uppercase mt-2 tracking-wider"
                  style={{ fontFamily: 'var(--font-titulo)' }}
                >
                  Minhas Figurinhas
                </h2>
                <p className="text-xs font-bold text-copa-blue-dark select-all mt-1 lowercase">
                  {email}
                </p>
              </div>

              {/* Lista */}
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const statusInfo = getStatusLabel(order.status)
                  const isPaid = order.status === 'PAID' || order.status === 'DELIVERED'

                  return (
                    <div
                      key={order.id}
                      className="border-2 border-gray-200 rounded-2xl p-4 bg-copa-gray/30 flex flex-col gap-3 font-semibold text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-gray-400 font-bold">PEDIDO #{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className="text-sm font-bold text-copa-blue uppercase">Craque: {order.lead.name}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Ações de Download se Pago */}
                      {isPaid ? (
                        <div className="flex gap-2">
                          <a
                            href={order.stickerUrl || `/api/sticker-image/${order.id}`}
                            download
                            className="flex-1 bg-copa-blue hover:bg-copa-blue-dark text-white font-bold text-[10px] py-2 px-1 rounded-lg border border-copa-blue-dark shadow-[1px_1px_0px_#12317A] text-center uppercase tracking-wide cursor-pointer active:scale-95 transition-all"
                          >
                            📥 PNG
                          </a>
                          <a
                            href={order.stickerPdfUrl || `/api/sticker-pdf/${order.id}`}
                            download
                            className="flex-1 bg-copa-green hover:bg-green-700 text-white font-bold text-[10px] py-2 px-1 rounded-lg border border-green-800 shadow-[1px_1px_0px_#04A934] text-center uppercase tracking-wide cursor-pointer active:scale-95 transition-all"
                          >
                            📄 PDF
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push(`/checkout/${order.id}`)}
                          className="w-full bg-copa-red hover:bg-red-700 text-white font-bold py-2.5 rounded-lg border border-red-800 shadow-[1.5px_1.5px_0px_#D93535] uppercase tracking-wide text-center cursor-pointer active:scale-95 transition-all"
                        >
                          💳 Finalizar Pagamento
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Botões de Rodapé */}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
                <button
                  onClick={() => router.push('/criar')}
                  className="w-full bg-white hover:bg-copa-gray text-copa-blue font-bold text-sm py-3 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] transition-all uppercase tracking-wide cursor-pointer text-center"
                >
                  ➕ Criar Nova Figurinha
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-center text-[10px] font-bold text-gray-400 hover:text-gray-500 uppercase underline cursor-pointer"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          )}
        </WizardCard>
      </div>
    </main>
  )
}
