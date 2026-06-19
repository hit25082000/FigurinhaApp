'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function DevResetButton() {
  const [isLocalhost, setIsLocalhost] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      setIsLocalhost(true)
    }
  }, [])

  if (!isLocalhost) return null

  const handleReset = () => {
    // Limpa todas as chaves do wizard no localStorage
    const keys = [
      'sticker_name',
      'sticker_photoUrl',
      'sticker_birthDay',
      'sticker_birthMonth',
      'sticker_birthYear',
      'sticker_email',
      'sticker_club',
      'sticker_weightKg',
      'sticker_heightCm',
      'sticker_step',
    ]
    keys.forEach((k) => localStorage.removeItem(k))

    // Redireciona para o início do fluxo
    router.push('/criar')
  }

  return (
    <button
      onClick={handleReset}
      title="DEV: Limpar cache e reiniciar o fluxo"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#1a1a2e',
        color: '#00ff88',
        border: '2px solid #00ff88',
        borderRadius: '12px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'monospace',
        cursor: 'pointer',
        boxShadow: '0 0 12px rgba(0,255,136,0.35)',
        letterSpacing: '0.5px',
        opacity: 0.9,
      }}
    >
      🔄 RESET DEV
    </button>
  )
}

export default DevResetButton
