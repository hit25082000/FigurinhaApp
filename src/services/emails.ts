import nodemailer from 'nodemailer'

export interface EmailService {
  sendDeliveryEmail(
    to: string,
    name: string,
    stickerUrl: string,
    pdfUrl: string,
    selectedBumps?: Array<{ id: string; name: string; priceCents: number }>
  ): Promise<boolean>
}

class MockEmailService implements EmailService {
  async sendDeliveryEmail(
    to: string,
    name: string,
    stickerUrl: string,
    pdfUrl: string,
    selectedBumps?: Array<{ id: string; name: string; priceCents: number }>
  ): Promise<boolean> {
    let bumpsText = ''
    if (selectedBumps && selectedBumps.length > 0) {
      bumpsText = '\n⚡ ITENS ADICIONAIS ADQUIRIDOS (ORDER BUMPS):\n' + 
        selectedBumps.map(b => `- ${b.name}`).join('\n')
    }

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
${bumpsText}

Obrigado por comprar conosco!
=========================================
    `)
    return true
  }
}

class NodemailerEmailService implements EmailService {
  async sendDeliveryEmail(
    to: string,
    name: string,
    stickerUrl: string,
    pdfUrl: string,
    selectedBumps?: Array<{ id: string; name: string; priceCents: number }>
  ): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      // Gerar HTML dos Bumps se houverem
      let bumpsHtml = ''
      let bumpsText = ''
      if (selectedBumps && selectedBumps.length > 0) {
        bumpsText = '\n\n⚡ Itens Adicionais (Order Bumps):\n'
        bumpsHtml = `
          <div style="margin-top: 25px; border-top: 2px dashed #eeeeee; padding-top: 20px;">
            <h3 style="color: #1E3F95; margin-bottom: 15px;">⚡ Seus Itens Adicionais Adquiridos:</h3>
        `

        selectedBumps.forEach(bump => {
          let downloadUrl = ''
          let actionText = ''
          if (bump.id === 'bump-pdf-pack') {
            downloadUrl = `${appUrl}/assets/pacote_figurinha.jpg`
            actionText = '📥 Baixar Pacote de Figurinhas'
            bumpsText += `- ${bump.name}: ${downloadUrl}\n`
          } else if (bump.id === 'bump-poster-a2') {
            downloadUrl = `${appUrl}/assets/A2.png`
            actionText = '🖼️ Baixar Pôster A2'
            bumpsText += `- ${bump.name}: ${downloadUrl}\n`
          } else if (bump.id === 'bump-brazil-selection') {
            downloadUrl = `${appUrl}/assets/pacote_brasil.jpeg`
            actionText = '🇧🇷 Baixar Figurinhas Seleção'
            bumpsText += `- ${bump.name}: ${downloadUrl}\n`
          } else if (bump.id === 'bump-neymar-edition') {
            downloadUrl = `${appUrl}/assets/figurinha_neymar.png`
            actionText = '⚽ Baixar Figurinha Neymar'
            bumpsText += `- ${bump.name}: ${downloadUrl}\n`
          } else {
            bumpsText += `- ${bump.name}: Confirmado no sorteio\n`
          }

          bumpsHtml += `
            <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <span style="font-size: 14px; font-weight: bold; color: #333333; display: block; margin-bottom: 8px;">${bump.name}</span>
              ${downloadUrl ? `
                <a href="${downloadUrl}" style="background-color: #1E3F95; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; display: inline-block;">${actionText}</a>
              ` : `
                <span style="font-size: 11px; font-weight: bold; color: #04A934; text-transform: uppercase;">✓ Participação Confirmada no Sorteio</span>
              `}
            </div>
          `
        })

        bumpsHtml += `</div>`
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'contato@minhafigurinhacopa.com.br',
        to,
        subject: `⚽ Seu Craque está pronto! Figurinha Copa 2026 de ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3F95; text-align: center;">⚽ Seu Craque está pronto!</h2>
            <p>Olá <strong>${name}</strong>!</p>
            <p>Seu pagamento foi confirmado com sucesso e sua figurinha digital oficial da Copa 2026 já está disponível para download.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${stickerUrl}" style="background-color: #1E3F95; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; display: inline-block;">📥 Baixar Figurinha (PNG)</a>
              <a href="${pdfUrl}" style="background-color: #04A934; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">📄 Baixar PDF para Impressão</a>
            </div>
            
            ${bumpsHtml}
            
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="font-size: 12px; color: #666666; text-align: center;">Se você tiver qualquer dúvida, responda a este e-mail.</p>
          </div>
        `,
        text: `Olá ${name}!\n\nSeu pagamento foi confirmado! A figurinha digital de ${name} foi gerada com sucesso.\n\nBaixe o PNG da figurinha: ${stickerUrl}\nBaixe o PDF para impressão: ${pdfUrl}${bumpsText}\n\nObrigado por comprar conosco!`,
      }

      await transporter.sendMail(mailOptions)
      console.log(`📧 E-mail real enviado com sucesso para: ${to}`)
      return true
    } catch (error) {
      console.error('Erro ao enviar e-mail via SMTP:', error)
      return false
    }
  }
}

export function getEmailService(): EmailService {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return new NodemailerEmailService()
  }
  return new MockEmailService()
}
