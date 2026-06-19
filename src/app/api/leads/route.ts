import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, email, birthDate, club, weightKg, heightCm, photoUrl } = data

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e E-mail são obrigatórios' }, { status: 400 })
    }

    // Tentar encontrar lead existente por e-mail ou criar um novo
    let lead = await db.lead.findFirst({
      where: { email }
    })

    const parsedBirthDate = birthDate ? new Date(birthDate) : null

    if (lead) {
      lead = await db.lead.update({
        where: { id: lead.id },
        data: {
          name,
          birthDate: parsedBirthDate,
          club,
          weightKg: weightKg ? parseInt(weightKg) : null,
          heightCm: heightCm ? parseInt(heightCm) : null,
          photoUrl
        }
      })
    } else {
      lead = await db.lead.create({
        data: {
          name,
          email,
          birthDate: parsedBirthDate,
          club,
          weightKg: weightKg ? parseInt(weightKg) : null,
          heightCm: heightCm ? parseInt(heightCm) : null,
          photoUrl
        }
      })
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error: any) {
    console.error('Erro ao salvar lead:', error)
    return NextResponse.json({ error: 'Erro interno do servidor: ' + error.message }, { status: 500 })
  }
}
