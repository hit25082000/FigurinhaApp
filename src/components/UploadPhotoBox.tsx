import React, { useRef, useState } from 'react'
import PhotoWarningModal from './PhotoWarningModal'

interface UploadPhotoBoxProps {
  value?: string // URL da foto carregada
  onChange: (photoUrl: string) => void
  error?: string
}

export function UploadPhotoBox({ value, onChange, error }: UploadPhotoBoxProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [hasSeenWarning, setHasSeenWarning] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = (useCamera: boolean = false) => {
    if (!hasSeenWarning) {
      setIsWarningOpen(true)
      // Salva qual input deve ser aberto após fechar o aviso
      sessionStorage.setItem('pending_upload_type', useCamera ? 'camera' : 'file')
    } else {
      openFileInput(useCamera)
    }
  }

  const openFileInput = (useCamera: boolean) => {
    if (useCamera && cameraInputRef.current) {
      cameraInputRef.current.click()
    } else if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleWarningClose = () => {
    setIsWarningOpen(false)
    setHasSeenWarning(true)
    const pendingType = sessionStorage.getItem('pending_upload_type')
    sessionStorage.removeItem('pending_upload_type')
    
    // Abre o input correspondente após fechar o modal
    setTimeout(() => {
      openFileInput(pendingType === 'camera')
    }, 150)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadError(null)

    // Validar formato
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato inválido. Use JPG, PNG ou WEBP')
      return
    }

    // Validar tamanho (8MB)
    const maxSizeBytes = 8 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setUploadError('A foto excede o limite de 8MB')
      return
    }

    // Exibir preview local imediatamente
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    // Fazer upload para a API
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao processar imagem')
      }

      onChange(data.photoUrl)
    } catch (err: any) {
      console.error(err)
      setUploadError(err.message || 'Erro ao fazer upload da imagem')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col w-full items-center gap-4">
      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Caixa de Preview / Upload (clicável) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Clique para enviar a foto do craque"
        onClick={() => !preview && handleUploadClick(false)}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !preview) handleUploadClick(false) }}
        className={`w-full aspect-square max-w-[240px] rounded-[24px] border-4 border-dashed border-copa-blue flex flex-col items-center justify-center p-4 bg-copa-gray text-center relative overflow-hidden transition-all shadow-inner ${
          error || uploadError ? 'border-copa-red' : 'hover:bg-copa-blue/10 hover:border-copa-blue-dark'
        } ${!preview ? 'cursor-pointer' : ''}`}
      >
        {preview ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Craque Preview" className="w-full h-full object-cover" />
            
            {/* Overlay de carregamento */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white p-2">
                <div className="w-8 h-8 border-4 border-t-copa-yellow border-white rounded-full animate-spin mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Enviando rosto...</span>
              </div>
            )}

            {/* Botão de limpar/remover */}
            {!isUploading && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  onChange('')
                }}
                className="absolute top-2 right-2 bg-copa-red hover:bg-red-700 active:scale-95 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-sm shadow cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center p-2 text-copa-blue-dark">
            <span className="text-5xl mb-2">📸</span>
            <span className="text-sm font-bold uppercase tracking-wider">Foto do Craque</span>
            <span className="text-[10px] opacity-75 mt-1 font-semibold leading-relaxed">
              Arraste ou clique abaixo para enviar
            </span>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
        <button
          type="button"
          onClick={() => handleUploadClick(false)}
          className="flex-1 bg-copa-blue hover:bg-copa-blue-dark active:scale-95 text-white font-bold text-sm py-4 px-4 rounded-xl border-2 border-copa-blue-dark shadow-[2px_2px_0px_#12317A] uppercase transition-all tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          🖼 Enviar foto do ROSTO
        </button>
        <button
          type="button"
          onClick={() => handleUploadClick(true)}
          className="bg-white hover:bg-copa-gray active:scale-95 text-copa-blue font-bold text-sm py-4 px-5 rounded-xl border-2 border-copa-blue shadow-[2px_2px_0px_#1E3F95] uppercase transition-all tracking-wide cursor-pointer"
          style={{ fontFamily: 'var(--font-titulo)' }}
        >
          📷 Câmera
        </button>
      </div>

      {/* Erros */}
      {(error || uploadError) && (
        <span className="text-xs font-bold text-copa-red text-center mt-1">
          ⚠️ {error || uploadError}
        </span>
      )}

      {/* Modal de Aviso */}
      <PhotoWarningModal isOpen={isWarningOpen} onClose={handleWarningClose} />
    </div>
  )
}
export default UploadPhotoBox
