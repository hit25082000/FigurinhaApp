import React, { useState } from 'react'

interface Order {
  id: string
  leadId: string
  lead: {
    name: string
    email: string
    birthDate: string | null
    club: string | null
    weightKg: number | null
    heightCm: number | null
    photoUrl: string | null
  }
  status: string
  stickerUrl: string | null
  stickerPdfUrl: string | null
  paymentStatus: string | null
  paymentProvider: string | null
  paymentId: string | null
  checkoutUrl: string | null
  totalCents: number
  selectedBumps: any[]
  createdAt: string
}

interface AdminOrderTableProps {
  orders: Order[]
  passwordHash: string // para assinar chamadas de admin
  onRefresh: () => void
}

export function AdminOrderTable({ orders, passwordHash, onRefresh }: AdminOrderTableProps) {
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null)

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesText =
      order.lead.name.toLowerCase().includes(filter.toLowerCase()) ||
      order.lead.email.toLowerCase().includes(filter.toLowerCase()) ||
      order.id.toLowerCase().includes(filter.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesText && matchesStatus
  })

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['ID Pedido', 'Nome Craque', 'E-mail', 'Clube', 'Status Pedido', 'Status Pagamento', 'Total (R$)', 'Data Criacao']
    const rows = filteredOrders.map(o => [
      o.id,
      o.lead.name,
      o.lead.email,
      o.lead.club || '',
      o.status,
      o.paymentStatus || '',
      (o.totalCents / 100).toFixed(2),
      new Date(o.createdAt).toLocaleDateString('pt-BR')
    ])

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `pedidos_minha_figurinha_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Atualizar status do pedido
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/manual-upload`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${passwordHash}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        onRefresh()
      } else {
        alert('Falha ao atualizar status')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Reenviar e-mail de entrega
  const handleResendEmail = async (orderId: string) => {
    try {
      const res = await fetch('/api/email/send-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${passwordHash}`,
        },
        body: JSON.stringify({ orderId }),
      })

      if (res.ok) {
        alert('E-mail enviado para o cliente!')
      } else {
        const data = await res.json()
        alert('Erro ao enviar e-mail: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Upload Manual de figurinha final
  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingOrderId(orderId)
    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/manual-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${passwordHash}`,
        },
        body: formData,
      })

      if (res.ok) {
        alert('Figurinha manual carregada com sucesso!')
        onRefresh()
      } else {
        const data = await res.json()
        alert('Falha ao enviar arquivo: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingOrderId(null)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filtros e Ações */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white border-2 border-copa-blue rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar por nome, e-mail, id..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-copa-blue min-w-[240px] flex-1 md:flex-initial"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-copa-blue"
          >
            <option value="">Filtrar Status (Todos)</option>
            <option value="LEAD_CREATED">LEAD_CREATED</option>
            <option value="PHOTO_UPLOADED">PHOTO_UPLOADED</option>
            <option value="PENDING_GENERATION">PENDING_GENERATION</option>
            <option value="GENERATING">GENERATING</option>
            <option value="GENERATED">GENERATED</option>
            <option value="CHECKOUT_STARTED">CHECKOUT_STARTED</option>
            <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
            <option value="PAID">PAID</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          className="bg-copa-green hover:bg-green-700 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-green-800 shadow-[2px_2px_0px_#04A934] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer self-stretch md:self-auto text-center justify-center transition-all"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Tabela de Pedidos */}
      <div className="w-full overflow-x-auto bg-white border-2 border-copa-blue rounded-2xl shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-copa-blue text-white uppercase tracking-wider font-bold">
              <th className="p-3">Foto Original</th>
              <th className="p-3">Dados do Craque</th>
              <th className="p-3">Preço/Bumps</th>
              <th className="p-3">Status do Pedido</th>
              <th className="p-3">Sticker Final</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-semibold text-copa-blue-dark">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wider">
                  Nenhum pedido encontrado
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <tr key={order.id} className="hover:bg-copa-gray/30 transition-colors">
                    {/* Foto Original */}
                    <td className="p-3 shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-copa-blue bg-white shadow-inner flex items-center justify-center">
                        {order.lead.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={order.lead.photoUrl}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>
                    </td>

                    {/* Dados do Lead */}
                    <td className="p-3 max-w-[220px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-copa-blue text-sm uppercase leading-tight">{order.lead.name}</span>
                        <span className="text-gray-500 lowercase select-all text-[10px] leading-none mb-1">{order.lead.email}</span>
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase">⚽ {order.lead.club || 'N/A'}</span>
                          {order.lead.weightKg && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{order.lead.weightKg}kg</span>}
                          {order.lead.heightCm && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{order.lead.heightCm}cm</span>}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1">{date}</span>
                      </div>
                    </td>

                    {/* Bumps e Preço */}
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-copa-green font-extrabold text-sm font-mono">
                          {(order.totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        {order.selectedBumps.length > 0 ? (
                          <div className="flex flex-col gap-0.5 mt-1">
                            {order.selectedBumps.map((b, i) => (
                              <span key={i} className="text-[9px] text-copa-green font-semibold">
                                + {b.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 font-semibold italic">Sem order bumps</span>
                        )}
                      </div>
                    </td>

                    {/* Status Pedido */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        {/* Selector de Status */}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="border border-gray-300 rounded px-1 py-1 text-[10px] font-bold bg-white"
                        >
                          <option value="LEAD_CREATED">LEAD_CREATED</option>
                          <option value="PHOTO_UPLOADED">PHOTO_UPLOADED</option>
                          <option value="PENDING_GENERATION">PENDING_GENERATION</option>
                          <option value="GENERATING">GENERATING</option>
                          <option value="GENERATED">GENERATED</option>
                          <option value="CHECKOUT_STARTED">CHECKOUT_STARTED</option>
                          <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="FAILED">FAILED</option>
                        </select>
                        <span className={`text-[9px] font-extrabold uppercase text-center px-2 py-0.5 rounded max-w-[100px] ${
                          order.paymentStatus === 'PAID' ? 'bg-copa-green/10 text-copa-green' : 'bg-copa-red/10 text-copa-red'
                        }`}>
                          {order.paymentStatus === 'PAID' ? '💳 PAGO' : '❌ PENDENTE'}
                        </span>
                      </div>
                    </td>

                    {/* Preview Figurinha */}
                    <td className="p-3">
                      <div className="flex flex-col items-center gap-1">
                        {order.stickerUrl ? (
                          <div className="relative w-12 h-16 rounded border border-gray-300 overflow-hidden shadow-inner flex items-center justify-center bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.stickerUrl}
                              alt="Sticker Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Não gerada</span>
                        )}

                        {/* Upload Manual de arquivo final */}
                        <label className="bg-white hover:bg-copa-gray text-copa-blue border border-copa-blue text-[9px] px-1.5 py-0.5 rounded cursor-pointer text-center font-bold tracking-wide active:scale-95 transition-all">
                          {uploadingOrderId === order.id ? 'Subindo...' : '📤 Upload Final'}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingOrderId === order.id}
                            onChange={(e) => handleManualUpload(e, order.id)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1 w-full max-w-[120px] mx-auto">
                        <button
                          onClick={() => handleResendEmail(order.id)}
                          type="button"
                          className="bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-[9px] py-1.5 px-2 rounded tracking-wider uppercase cursor-pointer"
                        >
                          ✉️ Reenviar E-mail
                        </button>
                        {order.stickerUrl && (
                          <a
                            href={order.stickerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-100 hover:bg-gray-200 text-copa-blue-dark border text-[9px] py-1 px-2 rounded text-center tracking-wider uppercase font-bold"
                          >
                            👁️ Ver Imagem
                          </a>
                        )}
                        {order.stickerPdfUrl && (
                          <a
                            href={order.stickerPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-100 hover:bg-gray-200 text-copa-blue-dark border text-[9px] py-1 px-2 rounded text-center tracking-wider uppercase font-bold"
                          >
                            📄 Ver PDF
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AdminOrderTable
