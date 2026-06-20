import fs from 'fs/promises'
import path from 'path'

export interface StorageProvider {
  uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string>
}

class TmpFilesStorageProvider implements StorageProvider {
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const formData = new FormData()
      const blob = new Blob([new Uint8Array(buffer)], { type: mimeType })
      formData.append('file', blob, fileName)

      console.log(`[TmpFilesStorageProvider] Uploading ${fileName} to tmpfiles.org...`)
      const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`tmpfiles.org upload failed: ${res.statusText} - ${errorText}`)
      }

      const json = await res.json()
      if (json.status !== 'success' || !json.data?.url) {
        throw new Error(`tmpfiles.org API returned failure: ${JSON.stringify(json)}`)
      }

      const viewerUrl = json.data.url
      const directDownloadUrl = viewerUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
      console.log(`[TmpFilesStorageProvider] Uploaded successfully: ${directDownloadUrl}`)
      return directDownloadUrl
    } catch (error: any) {
      console.error('[TmpFilesStorageProvider] Error uploading to tmpfiles.org:', error)
      throw error
    }
  }
}

class LocalStorageProvider implements StorageProvider {
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      // Garantir que a pasta public/uploads exista
      await fs.mkdir(uploadDir, { recursive: true })
      
      const filePath = path.join(uploadDir, fileName)
      await fs.writeFile(filePath, buffer)
      
      // Retorna a URL relativa servida estaticamente pelo Next.js
      return `/uploads/${fileName}`
    } catch (err: any) {
      console.warn(`[LocalStorageProvider] Failed to write locally (${err.message}). Falling back to tmpfiles.org...`)
      return new TmpFilesStorageProvider().uploadFile(buffer, fileName, mimeType)
    }
  }
}

class SupabaseStorageProvider implements StorageProvider {
  private url: string
  private serviceKey: string
  private bucket: string

  constructor() {
    this.url = process.env.SUPABASE_URL || ''
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    this.bucket = process.env.SUPABASE_BUCKET_NAME || 'stickers'
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    if (!this.url || !this.serviceKey) {
      console.warn('Supabase não configurado. Salvando localmente como fallback.')
      return new LocalStorageProvider().uploadFile(buffer, fileName, mimeType)
    }

    try {
      // Usar a REST API do Supabase Storage para evitar instalar o SDK pesado
      const uploadUrl = `${this.url}/storage/v1/object/${this.bucket}/${fileName}`
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceKey}`,
          'API-KEY': this.serviceKey,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: new Uint8Array(buffer)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Supabase upload failed: ${response.statusText} - ${errorText}`)
      }

      // Retorna a URL pública
      return `${this.url}/storage/v1/object/public/${this.bucket}/${fileName}`
    } catch (error) {
      console.error('Erro no upload do Supabase:', error)
      console.warn('Salvando localmente como fallback pós erro.')
      return new LocalStorageProvider().uploadFile(buffer, fileName, mimeType)
    }
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local'
  if (provider === 'supabase') {
    return new SupabaseStorageProvider()
  }
  if (provider === 'tmpfiles') {
    return new TmpFilesStorageProvider()
  }
  return new LocalStorageProvider()
}
