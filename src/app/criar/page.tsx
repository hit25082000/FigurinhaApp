'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressHeader from '@/components/ProgressHeader'
import WizardCard from '@/components/WizardCard'
import StepDots from '@/components/StepDots'
import UploadPhotoBox from '@/components/UploadPhotoBox'
import LoadingPhotoScreen from '@/components/LoadingPhotoScreen'
import BirthDateForm from '@/components/BirthDateForm'
import ClubDataForm from '@/components/ClubDataForm'
import ReviewDataCard from '@/components/ReviewDataCard'

export default function CriarStickerPage() {
  const router = useRouter()
  
  // Estados do Wizard
  const [step, setStep] = useState(1) // 1 a 4
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  
  // Dados do formulário
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [email, setEmail] = useState('')
  
  const [club, setClub] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')

  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [isSavingLead, setIsSavingLead] = useState(false)

  // Carregar dados salvos no localStorage ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('sticker_name') || '')
      setPhotoUrl(localStorage.getItem('sticker_photoUrl') || '')
      setBirthDay(localStorage.getItem('sticker_birthDay') || '')
      setBirthMonth(localStorage.getItem('sticker_birthMonth') || '')
      setBirthYear(localStorage.getItem('sticker_birthYear') || '')
      setEmail(localStorage.getItem('sticker_email') || '')
      setClub(localStorage.getItem('sticker_club') || '')
      setWeightKg(localStorage.getItem('sticker_weightKg') || '')
      setHeightCm(localStorage.getItem('sticker_heightCm') || '')
      
      const savedStep = localStorage.getItem('sticker_step')
      if (savedStep) {
        setStep(parseInt(savedStep))
      }
    }
  }, [])

  // Salvar alterações no localStorage
  const saveToLocalStorage = (key: string, val: string) => {
    localStorage.setItem(key, val)
  }

  const handleStepChange = (nextStep: number) => {
    setStep(nextStep)
    saveToLocalStorage('sticker_step', nextStep.toString())
  }

  // Passo 1 - Submissão do Nome
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep1Error(null)

    if (!name.trim()) {
      setStep1Error('O nome do craque é obrigatório')
      return
    }

    saveToLocalStorage('sticker_name', name)
    handleStepChange(2)
  }

  // Passo 4 - Submissão da Foto
  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep1Error(null)

    if (!photoUrl) {
      setStep1Error('A foto do craque é obrigatória')
      return
    }

    saveToLocalStorage('sticker_photoUrl', photoUrl)
    
    // Dispara a tela intermediária de análise de foto
    setIsLoadingPhoto(true)
  }

  // Passo 2 - Nascimento e Email
  const handleStep2Submit = (data: { day: string; month: string; year: string; email: string }) => {
    setBirthDay(data.day)
    setBirthMonth(data.month)
    setBirthYear(data.year)
    setEmail(data.email)

    saveToLocalStorage('sticker_birthDay', data.day)
    saveToLocalStorage('sticker_birthMonth', data.month)
    saveToLocalStorage('sticker_birthYear', data.year)
    saveToLocalStorage('sticker_email', data.email)

    handleStepChange(3)
  }

  // Passo 3 - Clube e Dados corporais
  const handleStep3Submit = (data: { club: string; weightKg: string; heightCm: string }) => {
    setClub(data.club)
    setWeightKg(data.weightKg)
    setHeightCm(data.heightCm)

    saveToLocalStorage('sticker_club', data.club)
    saveToLocalStorage('sticker_weightKg', data.weightKg)
    saveToLocalStorage('sticker_heightCm', data.heightCm)

    handleStepChange(4)
  }

  // Passo 4 - Finalizar e Gerar Figurinha (Salvar no banco)
  const handleFinalSubmit = async () => {
    setIsSavingLead(true)
    try {
      // 1. Salvar Lead
      const leadBirthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
      
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          birthDate: leadBirthDate,
          club,
          weightKg,
          heightCm,
          photoUrl
        })
      })
      
      const leadData = await leadRes.json()
      if (!leadRes.ok) {
        throw new Error(leadData.error || 'Erro ao salvar dados do lead')
      }

      // 2. Criar pedido vinculado ao Lead
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: leadData.leadId,
          bumpIds: [] // Sem bumps no início da criação
        })
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Erro ao criar pedido da figurinha')
      }

      // Limpar localStorage do wizard
      localStorage.removeItem('sticker_name')
      localStorage.removeItem('sticker_photoUrl')
      localStorage.removeItem('sticker_birthDay')
      localStorage.removeItem('sticker_birthMonth')
      localStorage.removeItem('sticker_birthYear')
      localStorage.removeItem('sticker_email')
      localStorage.removeItem('sticker_club')
      localStorage.removeItem('sticker_weightKg')
      localStorage.removeItem('sticker_heightCm')
      localStorage.removeItem('sticker_step')

      // Redireciona para tela de processamento /gerando/[orderId]
      router.push(`/gerando/${orderData.orderId}`)
    } catch (err: any) {
      alert(err.message || 'Ocorreu um erro ao salvar suas informações')
    } finally {
      setIsSavingLead(false)
    }
  }

  // Renderização Condicional
  if (isLoadingPhoto) {
    return (
      <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[430px]">
          <WizardCard>
            <LoadingPhotoScreen
              photoUrl={photoUrl}
              onComplete={() => {
                setIsLoadingPhoto(false)
                handleStepChange(5)
              }}
            />
          </WizardCard>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">
        {/* Barra de progresso */}
        <ProgressHeader step={step} />

        {/* Wizard Card Body */}
        <WizardCard>
          {/* Passo 1 - Nome */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="w-full flex flex-col gap-5">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
                  QUAL O NOME DO CRAQUE?
                </h2>
                <p className="text-sm font-semibold text-copa-blue-dark mt-1">
                  O nome que vai aparecer na figurinha
                </p>
              </div>

              {/* Input de Texto */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-copa-blue uppercase tracking-wide px-1">
                  Nome e Sobrenome
                </label>
                <input
                  type="text"
                  placeholder="Ex: Neymar Jr"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    saveToLocalStorage('sticker_name', e.target.value)
                  }}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-base font-semibold text-copa-blue-dark placeholder-gray-400 focus:outline-none focus:border-copa-blue"
                />
              </div>

              {/* Botão de Avanço */}
              <button
                type="submit"
                className="w-full bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-xl py-4 rounded-xl border-2 border-copa-blue-dark shadow-[4px_4px_0px_#12317A] transition-all uppercase tracking-wide cursor-pointer mt-2"
                style={{ fontFamily: 'var(--font-titulo)' }}
              >
                PRÓXIMO →
              </button>
            </form>
          )}

          {/* Passo 2 - Nascimento e Email */}
          {step === 2 && (
            <BirthDateForm
              defaultValues={{
                day: birthDay,
                month: birthMonth,
                year: birthYear,
                email: email,
              }}
              onBack={() => handleStepChange(1)}
              onSubmit={handleStep2Submit}
            />
          )}

          {/* Passo 3 - Clube e Dados */}
          {step === 3 && (
            <ClubDataForm
              defaultValues={{
                club,
                weightKg,
                heightCm,
              }}
              onBack={() => handleStepChange(2)}
              onSubmit={handleStep3Submit}
            />
          )}

          {/* Passo 4 - Envio de Foto */}
          {step === 4 && (
            <form onSubmit={handleStep4Submit} className="w-full flex flex-col gap-5">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-copa-blue uppercase tracking-wider" style={{ fontFamily: 'var(--font-titulo)' }}>
                  FOTO DO CRAQUE
                </h2>
                <p className="text-sm font-semibold text-copa-blue-dark mt-1">
                  Selecione uma foto nítida e de perto
                </p>
              </div>

              {/* Upload da Foto */}
              <div className="flex flex-col gap-1">
                <UploadPhotoBox
                  value={photoUrl}
                  onChange={(url) => {
                    setPhotoUrl(url)
                    saveToLocalStorage('sticker_photoUrl', url)
                  }}
                  error={step1Error || undefined}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleStepChange(3)}
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
          )}

          {/* Passo 5 - Confirmação de Informações */}
          {step === 5 && (
            <ReviewDataCard
              data={{
                name,
                photoUrl,
                club,
                weightKg,
                heightCm,
                email,
              }}
              onCorrect={() => handleStepChange(1)}
              onSubmit={handleFinalSubmit}
            />
          )}
        </WizardCard>

        {/* Dots Indicadores de Passo */}
        <StepDots currentStep={step} />
      </div>
    </main>
  )
}
