'use client'

import React, { useEffect, useState } from 'react'
import AdminOrderTable from '@/components/AdminOrderTable'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [orders, setOrders] = useState([])
  const [leads, setLeads] = useState([])
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Verifica login salvo no sessionStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPass = sessionStorage.getItem('admin_pass')
      if (savedPass) {
        fetchAdminData(savedPass)
      }
    }
  }, [])

  const fetchAdminData = async (pass: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${pass}`,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Senha incorreta')
      }

      setOrders(data.orders)
      setLeads(data.leads)
      setEvents(data.paymentEvents)
      setIsAuthorized(true)
      sessionStorage.setItem('admin_pass', pass)
      setPassword(pass)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao carregar dados admin')
      sessionStorage.removeItem('admin_pass')
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Por favor, informe a senha')
      return
    }
    fetchAdminData(password)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pass')
    setIsAuthorized(false)
    setPassword('')
    setOrders([])
  }

  // Estatísticas simples
  const totalSalesCents = orders
    .filter((o: any) => o.paymentStatus === 'PAID')
    .reduce((acc: number, curr: any) => acc + curr.totalCents, 0)
  
  const paidOrdersCount = orders.filter((o: any) => o.paymentStatus === 'PAID').length

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[380px] bg-white border-4 border-copa-blue rounded-[28px] shadow-[8px_8px_0px_#12317A] p-6 text-copa-blue-dark">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h2 className="text-2xl font-bold uppercase mt-2" style={{ fontFamily: 'var(--font-titulo)' }}>
              Painel Admin
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Informe a senha de administrador configurada no .env
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-copa-blue uppercase px-1">Senha de Acesso</label>
              <input
                type="password"
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-copa-blue"
              />
              {error && <span className="text-xs font-bold text-copa-red px-1 mt-1">⚠️ {error}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-base py-4 rounded-xl border-2 border-copa-blue-dark shadow-[3px_3px_0px_#12317A] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ fontFamily: 'var(--font-titulo)' }}
            >
              {isLoading ? 'Conectando...' : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-copa-gray/50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 text-copa-blue-dark">
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border-2 border-copa-blue rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚽</span>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold uppercase leading-none" style={{ fontFamily: 'var(--font-titulo)' }}>
                Painel Administrativo
              </h1>
              <span className="text-xs font-bold text-gray-500 uppercase mt-1">Figurinha Personalizada Copa 2026</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white hover:bg-copa-gray text-copa-red border-2 border-copa-red font-bold text-xs py-2.5 px-4 rounded-xl shadow-[2px_2px_0px_#D93535] uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            🚪 Sair do Painel
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase">Leads Capturados</span>
            <span className="text-3xl font-extrabold text-copa-blue font-mono mt-1">{leads.length}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase">Total de Pedidos</span>
            <span className="text-3xl font-extrabold text-copa-blue font-mono mt-1">{orders.length}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase">Pedidos Pagos</span>
            <span className="text-3xl font-extrabold text-copa-green font-mono mt-1">{paidOrdersCount}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase">Faturamento Total</span>
            <span className="text-3xl font-extrabold text-copa-green font-mono mt-1">
              {(totalSalesCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {/* Tabela de Pedidos Principal */}
        <AdminOrderTable
          orders={orders}
          passwordHash={password}
          onRefresh={() => fetchAdminData(password)}
        />
      </div>
    </main>
  )
}
