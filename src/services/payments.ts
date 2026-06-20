export interface PaymentSessionResult {
  checkoutUrl: string
  paymentId?: string
  pixQrCode?: string
  pixCopyPaste?: string
}

export interface PaymentProvider {
  createPaymentSession(
    orderId: string,
    email: string,
    amountCents: number,
    description: string,
    customerDetails?: {
      name?: string
      phone?: string
      cpf?: string
    }
  ): Promise<PaymentSessionResult>
}

class MockPaymentProvider implements PaymentProvider {
  async createPaymentSession(
    orderId: string,
    email: string,
    amountCents: number,
    description: string,
    customerDetails?: {
      name?: string
      phone?: string
      cpf?: string
    }
  ): Promise<PaymentSessionResult> {
    const isLocal = true
    const checkoutUrl = `/checkout/${orderId}/mock-gateway`
    
    // Simular dados do Pix
    const pixCopyPaste = `00020101021226830014br.gov.bcb.pix2561api.minhafigurinhacopa.com/v2/cob/order_${orderId}5204000053039865405${(amountCents / 100).toFixed(2)}5802BR5925Figurinha Copa 20266009SAO PAULO62070503***6304`
    
    // QR Code mockado (podemos usar uma imagem padrão do Google Charts que gera QR Code instantâneo a partir da chave)
    const pixQrCode = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(pixCopyPaste)}`

    return {
      checkoutUrl,
      paymentId: `mock_pay_${Math.random().toString(36).substring(2, 10)}`,
      pixQrCode,
      pixCopyPaste
    }
  }
}

class StripePaymentProvider implements PaymentProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.STRIPE_API_KEY || ''
  }

  async createPaymentSession(
    orderId: string,
    email: string,
    amountCents: number,
    description: string,
    customerDetails?: {
      name?: string
      phone?: string
      cpf?: string
    }
  ): Promise<PaymentSessionResult> {
    if (!this.apiKey) {
      console.warn('Chave Stripe não configurada. Usando MockPaymentProvider.')
      return new MockPaymentProvider().createPaymentSession(orderId, email, amountCents, description, customerDetails)
    }

    try {
      // Usar a API do Stripe via fetch
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'brl',
          'line_items[0][price_data][product_data][name]': description,
          'line_items[0][price_data][unit_amount]': amountCents.toString(),
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${process.env.NEXT_PUBLIC_APP_URL}/obrigado/${orderId}?status=success`,
          'cancel_url': `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${orderId}`,
          'customer_email': email,
          'metadata[orderId]': orderId,
        }).toString()
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || response.statusText)
      }

      const session = await response.json()
      return {
        checkoutUrl: session.url,
        paymentId: session.id
      }
    } catch (error) {
      console.error('Erro ao criar sessão Stripe:', error)
      return new MockPaymentProvider().createPaymentSession(orderId, email, amountCents, description, customerDetails)
    }
  }
}

class OnProfitPaymentProvider implements PaymentProvider {
  async createPaymentSession(
    orderId: string,
    email: string,
    amountCents: number,
    description: string,
    customerDetails?: {
      name?: string
      phone?: string
      cpf?: string
    }
  ): Promise<PaymentSessionResult> {
    const baseUrl = process.env.ONPROFIT_CHECKOUT_URL || 'https://pay.onprofit.com.br/MOCK_PRODUCT'
    
    const name = customerDetails?.name || ''
    const phone = customerDetails?.phone || ''

    const params = new URLSearchParams()
    if (name) params.append('name', name)
    if (email) params.append('email', email)
    if (phone) params.append('cellphone', phone)
    
    // Passamos o orderId no parâmetro 'src' para recuperar via webhook e redirecionamento
    params.append('src', orderId)

    const checkoutUrl = `${baseUrl}?${params.toString()}`

    return {
      checkoutUrl,
      paymentId: `onprofit_${orderId}`
    }
  }
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'mock'
  if (provider === 'stripe') {
    return new StripePaymentProvider()
  }
  if (provider === 'onprofit') {
    return new OnProfitPaymentProvider()
  }
  return new MockPaymentProvider()
}
