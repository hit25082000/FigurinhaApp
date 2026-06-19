export interface EmailService {
  sendDeliveryEmail(
    to: string,
    name: string,
    stickerUrl: string,
    pdfUrl: string
  ): Promise<boolean>
}

class MockEmailService implements EmailService {
  async sendDeliveryEmail(
    to: string,
    name: string,
    stickerUrl: string,
    pdfUrl: string
  ): Promise<boolean> {
    console.log(`
=========================================
📧 E-MAIL ENVIADO COM SUCESSO (MOCK)
Para: ${to}
Assunto: ⚽ Seu Craque está pronto! Figurinha Copa 2026 de ${name}
Corpo:
Olá! O pagamento foi confirmado!
A figurinha digital de ${name} foi gerada com sucesso.

Baixe o PNG da figurinha: ${stickerUrl}
Baixe o PDF para impressão: ${pdfUrl}

Obrigado por comprar conosco!
=========================================
    `)
    return true
  }
}

export function getEmailService(): EmailService {
  // Por padrão usamos o mock para rodada local. 
  // O usuário pode expandir para nodemailer usando as chaves no .env futuramente.
  return new MockEmailService()
}
