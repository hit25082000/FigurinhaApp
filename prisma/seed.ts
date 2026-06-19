import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de produtos...')

  // Limpar produtos existentes
  await prisma.product.deleteMany()

  // Produtos principais (Combos)
  const mainProducts = [
    {
      id: 'main-sticker', // Mantém compatibilidade com pedidos legados
      name: 'Figurinha Personalizada Copa 2026',
      description: 'Sua figurinha personalizada em formato digital de alta resolução.',
      priceCents: 1290,
      type: 'MAIN',
      active: true,
    },
    {
      id: 'main-sticker-1',
      name: '1 Figurinha Personalizada',
      description: '1 figurinha personalizada em alta resolução.',
      priceCents: 1290,
      type: 'MAIN',
      active: true,
    },
    {
      id: 'main-sticker-2',
      name: 'Combo Duplo (Leve 2 Figurinhas)',
      description: 'Crie duas figurinhas personalizadas (crie a segunda depois).',
      priceCents: 1990,
      type: 'MAIN',
      active: true,
    },
    {
      id: 'main-sticker-3',
      name: 'Combo Triplo (Leve 3 Figurinhas)',
      description: 'Crie três figurinhas personalizadas (crie as outras depois).',
      priceCents: 2490,
      type: 'MAIN',
      active: true,
    },
    {
      id: 'main-sticker-4',
      name: 'Combo Família (Leve 4 Figurinhas)',
      description: 'Crie quatro figurinhas personalizadas (crie as outras depois).',
      priceCents: 2990,
      type: 'MAIN',
      active: true,
    },
  ]

  for (const prod of mainProducts) {
    await prisma.product.create({
      data: prod,
    })
  }

  // Order Bumps
  const bumps = [
    {
      id: 'bump-pdf-pack',
      name: 'Pacote figurinha COPA 2026 - PDF IMPRESSÃO',
      description: 'Deixe a experiência ainda mais incrível com o PDF do pacotinho oficial da copa do mundo 2026.',
      priceCents: 490,
      type: 'BUMP',
      active: true,
    },
    {
      id: 'bump-poster-a2',
      name: 'Poste A2 Figurinha Personalizada - PDF IMPRESSÃO',
      description: 'Decore sua casa com um belo pôster da sua figurinha personalizada tamanho A2.',
      priceCents: 790,
      type: 'BUMP',
      active: true,
    },
    {
      id: 'bump-brazil-selection',
      name: 'Figurinhas da Seleção Brasileira 2026 - PDF Impressão',
      description: 'Todas as figurinhas para a impressão, complete ela com um clique.',
      priceCents: 1390,
      type: 'BUMP',
      active: true,
    },
    {
      id: 'bump-draw-chances',
      name: 'Sorteio de MIL REAIS - Aumente suas chances',
      description: 'Aumente suas chances no sorteio do dia 11/06/2026.',
      priceCents: 1492,
      type: 'BUMP',
      active: true,
    },
    {
      id: 'bump-neymar-edition',
      name: 'Edição Especial: Figurinha do Neymar - Camisa da Seleção',
      description: 'Adquira a figurinha do fenômeno brasileiro.',
      priceCents: 590,
      type: 'BUMP',
      active: true,
    },
  ]

  for (const bump of bumps) {
    await prisma.product.create({
      data: bump,
    })
  }

  console.log('Seed de produtos finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
