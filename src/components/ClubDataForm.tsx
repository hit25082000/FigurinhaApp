import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

const clubDataSchema = zod.object({
  club: zod.string()
    .min(1, 'Clube do coração é obrigatório')
    .max(30, 'Nome de clube muito longo'),
  weightKg: zod.string()
    .min(1, 'Peso é obrigatório')
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num > 0 && num < 250
    }, 'Peso inválido'),
  heightCm: zod.string()
    .min(1, 'Altura é obrigatória')
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num > 30 && num < 300
    }, 'Altura inválida'),
})

type ClubDataFormData = zod.infer<typeof clubDataSchema>

interface ClubDataFormProps {
  defaultValues: {
    club: string
    weightKg: string
    heightCm: string
  }
  onSubmit: (data: ClubDataFormData) => void
  onBack: () => void
}

const POPULAR_CLUBS = [
  'América Mineiro',
  'Athletico Paranaense',
  'Atlético Goianiense',
  'Atlético Mineiro',
  'Avaí',
  'Bahia',
  'Botafogo',
  'Ceará',
  'Chapecoense',
  'Corinthians',
  'Coritiba',
  'Criciúma',
  'Cruzeiro',
  'Cuiabá',
  'Figueirense',
  'Flamengo',
  'Fluminense',
  'Fortaleza',
  'Goiás',
  'Grêmio',
  'Guarani',
  'Internacional',
  'Juventude',
  'Palmeiras',
  'Paysandu',
  'Ponte Preta',
  'Red Bull Bragantino',
  'Remo',
  'Santa Cruz',
  'Santos',
  'Sport Recife',
  'São Paulo',
  'Vasco da Gama',
  'Vitória'
]

export function ClubDataForm({ defaultValues, onSubmit, onBack }: ClubDataFormProps) {
  const [selectedOption, setSelectedOption] = React.useState(() => {
    if (defaultValues.club && POPULAR_CLUBS.includes(defaultValues.club)) {
      return defaultValues.club
    }
    if (!defaultValues.club) return ''
    return 'outro'
  })
  
  const [customClub, setCustomClub] = React.useState(() => {
    if (defaultValues.club && !POPULAR_CLUBS.includes(defaultValues.club)) {
      return defaultValues.club
    }
    return ''
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClubDataFormData>({
    resolver: zodResolver(clubDataSchema),
    defaultValues,
  })

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedOption(val)
    if (val !== 'outro') {
      setValue('club', val, { shouldValidate: true })
    } else {
      setValue('club', customClub, { shouldValidate: true })
    }
  }

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomClub(val)
    setValue('club', val, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
          CLUBE E DADOS
        </h2>
        <p className="text-sm font-semibold text-copa-blue-dark mt-1">
          O clube do coração e os dados pra figurinha
        </p>
      </div>

      {/* Campo Clube */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
          Clube do Coração
        </label>
        
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className={`w-full bg-white border-2 rounded-xl py-3.5 px-4 text-base font-semibold text-copa-blue-dark focus:outline-none focus:border-copa-blue ${
            errors.club ? 'border-copa-red' : 'border-gray-200'
          }`}
        >
          <option value="" disabled>Selecione seu time...</option>
          {POPULAR_CLUBS.map(club => (
            <option key={club} value={club}>{club}</option>
          ))}
          <option value="outro">Outro time / Digitar manualmente...</option>
        </select>

        {/* Input de texto condicional para customizado */}
        {selectedOption === 'outro' && (
          <input
            type="text"
            placeholder="Digite o nome do seu time..."
            value={customClub}
            onChange={handleCustomTextChange}
            className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-base font-semibold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue mt-2 animate-fade-in ${
              errors.club ? 'border-copa-red' : 'border-gray-200'
            }`}
          />
        )}

        {/* Registrador oculto para o react-hook-form */}
        <input type="hidden" {...register('club')} />

        {errors.club && (
          <span className="text-xs font-bold text-copa-red px-1">
            ⚠️ {errors.club.message}
          </span>
        )}
      </div>

      {/* Grid para Peso e Altura */}
      <div className="grid grid-cols-2 gap-4">
        {/* Campo Peso */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
            Peso (em kg)
          </label>
          <input
            type="number"
            placeholder="Ex: 68"
            {...register('weightKg')}
            className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-base font-semibold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue ${
              errors.weightKg ? 'border-copa-red' : 'border-gray-200'
            }`}
          />
          {errors.weightKg && (
            <span className="text-xs font-bold text-copa-red px-1">
              ⚠️ {errors.weightKg.message}
            </span>
          )}
        </div>

        {/* Campo Altura */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
            Altura (em cm)
          </label>
          <input
            type="number"
            placeholder="Ex: 172"
            {...register('heightCm')}
            className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-base font-semibold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue ${
              errors.heightCm ? 'border-copa-red' : 'border-gray-200'
            }`}
          />
          {errors.heightCm && (
            <span className="text-xs font-bold text-copa-red px-1">
              ⚠️ {errors.heightCm.message}
            </span>
          )}
        </div>
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
export default ClubDataForm
