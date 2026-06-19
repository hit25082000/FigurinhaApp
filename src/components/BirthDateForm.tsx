import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

const currentYear = new Date().getFullYear()

const birthDateSchema = zod.object({
  day: zod.string()
    .min(1, 'Dia é obrigatório')
    .refine((val) => {
      const num = parseInt(val)
      return num >= 1 && num <= 31
    }, 'Dia inválido'),
  month: zod.string()
    .min(1, 'Mês é obrigatório')
    .refine((val) => {
      const num = parseInt(val)
      return num >= 1 && num <= 12
    }, 'Mês inválido'),
  year: zod.string()
    .min(4, 'Ano completo com 4 dígitos')
    .refine((val) => {
      const num = parseInt(val)
      return num >= 1900 && num <= currentYear
    }, 'Ano inválido'),
  email: zod.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
})

type BirthDateFormData = zod.infer<typeof birthDateSchema>

interface BirthDateFormProps {
  defaultValues: {
    day: string
    month: string
    year: string
    email: string
  }
  onSubmit: (data: BirthDateFormData) => void
  onBack: () => void
}

export function BirthDateForm({ defaultValues, onSubmit, onBack }: BirthDateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BirthDateFormData>({
    resolver: zodResolver(birthDateSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
          DATA DE NASCIMENTO
        </h2>
        <p className="text-sm font-semibold text-copa-blue-dark mt-1">
          Pra calcular a idade na figurinha
        </p>
      </div>

      {/* Grid para Nascimento */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
          Data de Nascimento
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Dia */}
          <div className="flex flex-col">
            <input
              type="number"
              placeholder="Dia"
              maxLength={2}
              {...register('day')}
              className={`w-full bg-white border-2 rounded-xl py-3 text-center text-lg font-bold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue ${
                errors.day ? 'border-copa-red' : 'border-gray-200'
              }`}
            />
          </div>

          {/* Mês */}
          <div className="flex flex-col">
            <select
              {...register('month')}
              className={`w-full bg-white border-2 rounded-xl py-3 px-2 text-center text-sm font-bold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
                errors.month ? 'border-copa-red' : 'border-gray-200'
              }`}
            >
              <option value="">Mês</option>
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          {/* Ano */}
          <div className="flex flex-col">
            <input
              type="number"
              placeholder="Ano"
              maxLength={4}
              {...register('year')}
              className={`w-full bg-white border-2 rounded-xl py-3 text-center text-lg font-bold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue ${
                errors.year ? 'border-copa-red' : 'border-gray-200'
              }`}
            />
          </div>
        </div>
        {/* Exibir erro de data se houver */}
        {(errors.day || errors.month || errors.year) && (
          <span className="text-xs font-bold text-copa-red px-1 mt-1">
            ⚠️ {errors.day?.message || errors.month?.message || errors.year?.message}
          </span>
        )}
      </div>

      {/* Campo E-mail */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
          E-mail de Contato
        </label>
        <input
          type="email"
          placeholder="Ex: craque@email.com"
          {...register('email')}
          className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-base font-semibold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue ${
            errors.email ? 'border-copa-red' : 'border-gray-200'
          }`}
        />
        {errors.email && (
          <span className="text-xs font-bold text-copa-red px-1">
            ⚠️ {errors.email.message}
          </span>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-white hover:bg-copa-gray active:scale-95 text-copa-blue font-bold text-base py-4 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] transition-all uppercase cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          VOLTAR
        </button>
        <button
          type="submit"
          className="flex-[2] bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-base py-4 rounded-xl border-2 border-copa-blue-dark shadow-[2px_2px_0px_#12317A] transition-all uppercase tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          PRÓXIMO →
        </button>
      </div>
    </form>
  )
}
export default BirthDateForm
