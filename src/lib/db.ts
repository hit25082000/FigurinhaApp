import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Converte chaves de retorno do Supabase (ex: Lead -> lead)
function mapOrder(order: any) {
  if (!order) return null
  const mapped = { ...order }
  if (mapped.Lead) {
    mapped.lead = mapped.Lead
    delete mapped.Lead
  }
  return mapped
}

export const db = {
  lead: {
    async findFirst({ where }: { where: { email: string } }) {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('email', where.email)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
    async findUnique({ where }: { where: { id: string } }) {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('id', where.id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
    async findMany(options?: { orderBy?: { createdAt: 'desc' | 'asc' } }) {
      let query = supabase.from('Lead').select('*')
      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' })
      }
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },
    async create({ data }: { data: any }) {
      const { data: created, error } = await supabase
        .from('Lead')
        .insert({ id: data.id || randomUUID(), updatedAt: new Date(), ...data })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return created
    },
    async update({ where, data }: { where: { id: string }; data: any }) {
      const { data: updated, error } = await supabase
        .from('Lead')
        .update({ updatedAt: new Date(), ...data })
        .eq('id', where.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return updated
    }
  },
  order: {
    async findUnique({ where, include }: { where: { id: string }; include?: { lead: boolean } }) {
      const selectFields = include?.lead ? '*, Lead(*)' : '*'
      const { data, error } = await supabase
        .from('Order')
        .select(selectFields)
        .eq('id', where.id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return mapOrder(data)
    },
    async findMany(options?: { include?: { lead: boolean }; orderBy?: { createdAt: 'desc' | 'asc' } }) {
      const selectFields = options?.include?.lead ? '*, Lead(*)' : '*'
      let query = supabase.from('Order').select(selectFields)
      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' })
      }
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return (data || []).map(mapOrder)
    },
    async create({ data }: { data: any }) {
      const { data: created, error } = await supabase
        .from('Order')
        .insert({ id: data.id || randomUUID(), updatedAt: new Date(), ...data })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return created
    },
    async update({ where, data }: { where: { id: string }; data: any }) {
      const { data: updated, error } = await supabase
        .from('Order')
        .update({ updatedAt: new Date(), ...data })
        .eq('id', where.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return updated
    }
  },
  product: {
    async findUnique({ where }: { where: { id: string } }) {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', where.id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
    async findMany(options?: { where?: { id?: { in: string[] }; type?: string; active?: boolean } }) {
      let query = supabase.from('Product').select('*')
      if (options?.where) {
        if (options.where.id?.in) {
          query = query.in('id', options.where.id.in)
        }
        if (options.where.type) {
          query = query.eq('type', options.where.type)
        }
        if (options.where.active !== undefined) {
          query = query.eq('active', options.where.active)
        }
      }
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },
    async deleteMany() {
      const { error } = await supabase.from('Product').delete().neq('id', '')
      if (error) throw new Error(error.message)
      return { count: 0 }
    },
    async create({ data }: { data: any }) {
      const { data: created, error } = await supabase
        .from('Product')
        .insert({ id: data.id || randomUUID(), ...data })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return created
    }
  },
  paymentEvent: {
    async findMany(options?: { orderBy?: { createdAt: 'desc' | 'asc' } }) {
      let query = supabase.from('PaymentEvent').select('*')
      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' })
      }
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },
    async create({ data }: { data: any }) {
      const { data: created, error } = await supabase
        .from('PaymentEvent')
        .insert({ id: data.id || randomUUID(), ...data })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return created
    }
  }
}
