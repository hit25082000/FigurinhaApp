import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import PaymentMethodTabs from './PaymentMethodTabs'
import OrderSummary from './OrderSummary'
import OrderBumpCard from './OrderBumpCard'
import StickerPackageSelector from './StickerPackageSelector'

// Validador de CPF básico
const validateCPF = (cpf: string) => {
  const clean = cpf.replace(/[^\d]/g, '')
  if (clean.length !== 11 && clean.length !== 14) return false
  return true
}

const checkoutSchema = zod.object({
  name: zod.string().min(5, 'Nome completo é obrigatório (mínimo 5 letras)'),
  email: zod.string().email('E-mail inválido'),
  confirmEmail: zod.string().email('Confirmação inválida'),
  cpf: zod.string().refine(validateCPF, 'CPF ou CNPJ inválido'),
  phone: zod.string().min(10, 'Celular com DDD inválido'),
  // Campos do cartão (opcionais, validados condicionalmente)
  cardNumber: zod.string().optional(),
  cardHolder: zod.string().optional(),
  cardMonth: zod.string().optional(),
  cardYear: zod.string().optional(),
  cardCvv: zod.string().optional(),
  installments: zod.string().optional(),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Os e-mails informados são diferentes',
  path: ['confirmEmail'],
})

type CheckoutFormData = zod.infer<typeof checkoutSchema>

interface Bump {
  id: string
  name: string
  description: string
  priceCents: number
}

interface CheckoutFormProps {
  orderId: string
  mainPriceCents: number
  availableBumps: Bump[]
  onSubmitSuccess: (orderId: string) => void
}

export function CheckoutForm({ orderId, mainPriceCents: initialMainPriceCents, availableBumps, onSubmitSuccess }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [selectedBumps, setSelectedBumps] = useState<string[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState('main-sticker-1')
  const [mainPriceCents, setMainPriceCents] = useState(initialMainPriceCents)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string } | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false)

  const handlePackageChange = (id: string, price: number) => {
    setSelectedPackageId(id)
    setMainPriceCents(price)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      confirmEmail: '',
      cpf: '',
      phone: '',
      installments: '1',
    },
  })

  // Calcular total dinamicamente
  const activeBumps = availableBumps.filter((b) => selectedBumps.includes(b.id))
  const totalCents = mainPriceCents + activeBumps.reduce((acc, curr) => acc + curr.priceCents, 0)

  const toggleBump = (id: string) => {
    setSelectedBumps((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    )
  }

  const handleCheckoutSubmit = async (data: CheckoutFormData) => {
    // Validar cartão manualmente se selecionado
    if (paymentMethod === 'card') {
      if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 15) {
        alert('Número do cartão inválido')
        return
      }
      if (!data.cardHolder) {
        alert('Nome do titular obrigatório')
        return
      }
      if (!data.cardMonth || !data.cardYear) {
        alert('Validade do cartão obrigatória')
        return
      }
      if (!data.cardCvv || data.cardCvv.length < 3) {
        alert('Código de segurança (CVV) inválido')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Criar pedido final atualizando bumps, pacote selecionado e dados
      // Atualizar pedido com bumps e produto principal selecionados primeiro
      const updateOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: orderId,
          bumpIds: selectedBumps,
          mainProductId: selectedPackageId,
        }),
      })
      const orderData = await updateOrderRes.json()
      const finalOrderId = orderData.orderId || orderId

      // Criar transação de pagamento
      const checkoutRes = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: finalOrderId,
          email: data.email,
          name: data.name,
          cpf: data.cpf,
          phone: data.phone,
        }),
      })

      const checkoutData = await checkoutRes.json()

      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Falha no checkout')
      }

      // Redireciona se for uma URL externa (como OnProfit)
      if (checkoutData.checkoutUrl && checkoutData.checkoutUrl.startsWith('http') && !checkoutData.checkoutUrl.startsWith('/checkout/')) {
        window.location.href = checkoutData.checkoutUrl
        return
      }

      if (paymentMethod === 'pix') {
        // Exibir dados do pix
        setPixData({
          qrCode: checkoutData.pixQrCode,
          copyPaste: checkoutData.pixCopyPaste,
        })
      } else {
        // Se for cartão, simular aprovação automática enviando webhook de sucesso
        await simulatePaymentConfirm(finalOrderId)
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const simulatePaymentConfirm = async (targetOrderId: string) => {
    setIsSimulatingPayment(true)
    try {
      const webhookRes = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrderId,
          status: 'APPROVED',
          paymentProvider: 'mock',
          paymentId: `mock_trans_${Math.random().toString(36).substring(2, 9)}`,
        }),
      })
      
      if (webhookRes.ok) {
        // Redireciona para página de obrigado
        onSubmitSuccess(targetOrderId)
      } else {
        alert('Falha ao simular confirmação de pagamento')
      }
    } catch (err) {
      console.error('Erro na simulação do webhook:', err)
    } finally {
      setIsSimulatingPayment(false)
    }
  }

  const copyPixKey = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.copyPaste)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Visualização de Bumps */}
      {availableBumps.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-copa-blue uppercase tracking-widest">
              ⚡ OFERTA EXCLUSIVA (Order Bumps)
            </h3>
            <button
              type="button"
              onClick={() => {
                if (selectedBumps.length === availableBumps.length) {
                  setSelectedBumps([])
                } else {
                  setSelectedBumps(availableBumps.map((b) => b.id))
                }
              }}
              className="text-[10px] font-bold text-copa-blue uppercase underline cursor-pointer"
            >
              Selecionar Todos ({selectedBumps.length}/{availableBumps.length})
            </button>
          </div>
          {availableBumps.map((bump) => (
            <OrderBumpCard
              key={bump.id}
              product={bump}
              isSelected={selectedBumps.includes(bump.id)}
              onToggle={() => toggleBump(bump.id)}
            />
          ))}
        </div>
      )}

      {/* Resumo de valores */}
      <OrderSummary
        mainProductPriceCents={mainPriceCents}
        selectedBumps={activeBumps}
        totalCents={totalCents}
      />

      {/* Se o Pix foi gerado, mostra o QR Code e oculta o formulário de cadastro */}
      {pixData ? (
        <div className="bg-copa-gray rounded-[24px] border-2 border-copa-blue p-6 flex flex-col items-center text-center shadow-md animate-scale-up text-copa-blue-dark">
          <span className="text-3xl mb-1">⚡</span>
          <h3 className="text-xl font-bold uppercase tracking-wider">Pix Gerado com Sucesso!</h3>
          <p className="text-xs text-gray-500 font-semibold max-w-xs mt-1.5 leading-relaxed">
            Escaneie o código abaixo com o aplicativo do seu banco ou copie a chave Pix.
          </p>

          {/* QR Code */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 my-4 shadow shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pixData.qrCode} alt="Pix QR Code" className="w-48 h-48" />
          </div>

          {/* Copia e Cola */}
          <button
            onClick={copyPixKey}
            type="button"
            className="w-full bg-white hover:bg-copa-gray text-copa-blue font-bold text-xs py-3 px-4 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] uppercase tracking-wider flex items-center justify-center gap-1.5 mb-4 cursor-pointer active:scale-95 transition-all"
          >
            {isCopied ? '✓ Copiado!' : '📋 Copiar Código Pix'}
          </button>

          {/* Botão de Simulação no local */}
          <button
            onClick={() => simulatePaymentConfirm(orderId)}
            disabled={isSimulatingPayment}
            type="button"
            className="w-full bg-copa-green hover:bg-green-700 active:scale-95 text-white font-bold text-base py-4 rounded-xl border-2 border-green-800 shadow-[3px_3px_0px_#04A934] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            style={{ fontFamily: 'var(--font-titulo)' }}
          >
            {isSimulatingPayment ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Confirmando...
              </>
            ) : (
              '👍 Confirmar Pagamento (Simulação)'
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="flex flex-col gap-4">
          {/* Seletor de Combos de Produtos */}
          <div className="mb-2">
            <StickerPackageSelector
              selectedId={selectedPackageId}
              onChange={handlePackageChange}
            />
          </div>

          <h3 className="text-xs font-bold text-copa-blue uppercase tracking-widest border-b pb-1">
            👤 Dados de Cobrança e Entrega
          </h3>

          {/* Nome completo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-copa-blue uppercase px-1">Nome Completo</label>
            <input
              type="text"
              placeholder="Ex: Neymar da Silva Santos"
              {...register('name')}
              className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                errors.name ? 'border-copa-red' : 'border-gray-200'
              }`}
            />
            {errors.name && <span className="text-[10px] font-bold text-copa-red px-1">⚠️ {errors.name.message}</span>}
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-copa-blue uppercase px-1">E-mail</label>
            <input
              type="email"
              placeholder="Ex: Neymar@email.com"
              {...register('email')}
              className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                errors.email ? 'border-copa-red' : 'border-gray-200'
              }`}
            />
            {errors.email && <span className="text-[10px] font-bold text-copa-red px-1">⚠️ {errors.email.message}</span>}
          </div>

          {/* Confirmar e-mail */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-copa-blue uppercase px-1">Confirmar E-mail</label>
            <input
              type="email"
              placeholder="Digite o e-mail novamente"
              {...register('confirmEmail')}
              className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                errors.confirmEmail ? 'border-copa-red' : 'border-gray-200'
              }`}
            />
            {errors.confirmEmail && <span className="text-[10px] font-bold text-copa-red px-1">⚠️ {errors.confirmEmail.message}</span>}
          </div>

          {/* CPF/CNPJ e Celular */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-copa-blue uppercase px-1">CPF ou CNPJ</label>
              <input
                type="text"
                placeholder="Ex: 000.000.000-00"
                {...register('cpf')}
                className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                  errors.cpf ? 'border-copa-red' : 'border-gray-200'
                }`}
              />
              {errors.cpf && <span className="text-[10px] font-bold text-copa-red px-1">⚠️ {errors.cpf.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-copa-blue uppercase px-1">Celular com DDD</label>
              <input
                type="text"
                placeholder="Ex: (11) 99999-9999"
                {...register('phone')}
                className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                  errors.phone ? 'border-copa-red' : 'border-gray-200'
                }`}
              />
              {errors.phone && <span className="text-[10px] font-bold text-copa-red px-1">⚠️ {errors.phone.message}</span>}
            </div>
          </div>

          {/* Tabs de Pagamento */}
          <h3 className="text-xs font-bold text-copa-blue uppercase tracking-widest border-b pb-1 mt-4">
            💳 Forma de Pagamento
          </h3>
          <PaymentMethodTabs activeTab={paymentMethod} onChange={setPaymentMethod} />

          {/* Se Cartão de Crédito selecionado, mostra campos de cartão */}
          {paymentMethod === 'card' && (
            <div className="flex flex-col gap-3 bg-copa-gray/50 border border-gray-200 rounded-2xl p-4 animate-fade-in text-copa-blue-dark">
              {/* Número do Cartão */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  {...register('cardNumber')}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold focus:outline-none focus:border-copa-blue"
                />
              </div>

              {/* Nome do Titular */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase">Nome do Titular (Como no cartão)</label>
                <input
                  type="text"
                  placeholder="EX: NEYMAR D S SANTOS"
                  {...register('cardHolder')}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold focus:outline-none focus:border-copa-blue"
                />
              </div>

              {/* Data de Vencimento e CVV */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase">Mês</label>
                  <input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    {...register('cardMonth')}
                    className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-center text-sm font-semibold focus:outline-none focus:border-copa-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase">Ano</label>
                  <input
                    type="text"
                    placeholder="AA"
                    maxLength={2}
                    {...register('cardYear')}
                    className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-center text-sm font-semibold focus:outline-none focus:border-copa-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    {...register('cardCvv')}
                    className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-center text-sm font-semibold focus:outline-none focus:border-copa-blue"
                  />
                </div>
              </div>

              {/* Parcelas */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase">Opções de Parcelamento</label>
                <select
                  {...register('installments')}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold focus:outline-none focus:border-copa-blue"
                >
                  <option value="1">1x de {(totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros</option>
                  <option value="2">2x de {((totalCents * 1.07) / 200).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} com juros</option>
                </select>
              </div>
            </div>
          )}

          {/* Botão de Finalizar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-copa-green hover:bg-green-700 active:scale-95 text-white font-bold text-xl py-4.5 rounded-xl border-2 border-green-800 shadow-[4px_4px_0px_#04A934] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-4"
            style={{ fontFamily: 'var(--font-titulo)' }}
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              paymentMethod === 'pix' ? 'Gerar Pix ⚡' : 'Comprar Agora 💳'
            )}
          </button>

          {/* Rodapé de segurança */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-copa-green uppercase mt-2">
            <span>🔒</span> Esta Página é Segura
          </div>
        </form>
      )}

      {/* Links de Rodapé */}
      <div className="flex justify-center gap-4 text-[10px] font-semibold text-gray-400 mt-4 border-t pt-4">
        <a href="#termos" className="hover:underline">Termos de Compra</a>
        <a href="#privacidade" className="hover:underline">Política de Privacidade</a>
        <a href="#contato" className="hover:underline">Contato</a>
      </div>
    </div>
  )
}
export default CheckoutForm
