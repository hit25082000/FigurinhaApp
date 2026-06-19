'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import WizardCard from '@/components/WizardCard'
import GeneratingScreen from '@/components/GeneratingScreen'

export default function GerandoStickerPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const { orderId } = use(params)

  const handleComplete = () => {
    router.push(`/resultado/${orderId}`)
  }

  return (
    <main className="min-h-screen bg-copa-yellow flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">
        <WizardCard>
          <GeneratingScreen orderId={orderId} onComplete={handleComplete} />
        </WizardCard>
      </div>
    </main>
  )
}
