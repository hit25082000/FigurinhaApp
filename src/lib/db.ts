import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Se estiver em produção (Vercel) e configurado com SQLite no diretório /tmp,
// copiamos o banco inicial pré-semeado (prisma/dev.db) para lá para que possamos escrever.
const dbUrl = process.env.DATABASE_URL || ''
if (dbUrl.includes('/tmp/')) {
  try {
    const tmpPath = dbUrl.replace('file:', '')
    if (!fs.existsSync(tmpPath)) {
      // O banco de dados original está em prisma/dev.db na raiz do projeto compilado
      const srcPath = path.join(process.cwd(), 'prisma', 'dev.db')
      if (fs.existsSync(srcPath)) {
        console.log(`[Database Init] Copiando banco SQLite semeado de ${srcPath} para ${tmpPath}...`)
        fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
        fs.copyFileSync(srcPath, tmpPath)
        fs.chmodSync(tmpPath, 0o666) // Garantir permissão de leitura e escrita
      } else {
        console.warn(`[Database Init] Banco de dados original não encontrado em ${srcPath}`)
      }
    }
  } catch (err) {
    console.error('[Database Init] Erro ao copiar o banco SQLite:', err)
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
