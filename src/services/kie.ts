import fs from 'fs/promises'
import path from 'path'
import { getStorageProvider } from './storage'

/**
 * Returns a publicly accessible URL for the given photoUrl.
 * If the URL is already public, it returns it as is.
 * If it's a local/relative path, it uploads it to tmpfiles.org and returns a direct download link.
 */
async function getPublicUrl(photoUrl: string): Promise<string> {
  // If it's already a public URL (and not pointing to localhost or 127.0.0.1)
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    if (!photoUrl.includes('localhost') && !photoUrl.includes('127.0.0.1')) {
      return photoUrl
    }
  }

  // Normalize relative or local path
  const normalizedPath = photoUrl.startsWith('/') || photoUrl.startsWith('\\')
    ? photoUrl
    : `/${photoUrl}`
  
  const localFilePath = path.join(process.cwd(), 'public', normalizedPath)

  try {
    const fileBuffer = await fs.readFile(localFilePath)
    const fileName = path.basename(localFilePath)
    const ext = path.extname(fileName).toLowerCase().replace('.', '')
    
    let mimeType = 'image/jpeg'
    if (ext === 'png') mimeType = 'image/png'
    if (ext === 'webp') mimeType = 'image/webp'

    // Create native FormData payload
    const formData = new FormData()
    const blob = new Blob([fileBuffer], { type: mimeType })
    formData.append('file', blob, fileName)

    console.log(`[Kie AI Service] Uploading local file ${fileName} to tmpfiles.org...`)
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
    // Convert to direct download link: replace tmpfiles.org/ with tmpfiles.org/dl/
    const directDownloadUrl = viewerUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    console.log(`[Kie AI Service] Temp public URL generated: ${directDownloadUrl}`)
    return directDownloadUrl
  } catch (error: any) {
    console.error(`[Kie AI Service] Error generating public URL:`, error)
    throw new Error(`Erro ao gerar URL pública da foto: ${error.message}`)
  }
}

export interface LeadData {
  name: string
  birthDate?: Date | null
  club?: string | null
  weightKg?: number | null
  heightCm?: number | null
}

/**
 * Submits an image-to-image job to Kie AI using the official sticker template.
 * Sends the template + person's photo so the AI fills the silhouette and bottom data fields.
 */
export async function generateAIStickerImage(leadPhotoUrl: string, lead: LeadData): Promise<string> {
  const apiKey = process.env.KIE_AI_API_KEY || 'bb8d7ed31c96a0d03114f7fdd05bc2fc'
  const name = lead.name || 'CRAQUE'

  // 1. Get a public URL for the person's photo
  const publicInputUrl = await getPublicUrl(leadPhotoUrl)

  // 2. Get a public URL for the sticker template
  const publicTemplateUrl = await getPublicUrl('/sticker-template.png')
  console.log(`[Kie AI Service] Template URL: ${publicTemplateUrl}`)

  // 3. Build data strings for the bottom strip
  let birthStr = ''
  if (lead.birthDate) {
    const d = new Date(lead.birthDate)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    birthStr = `${day}-${month}-${year}`
  }
  const heightStr = lead.heightCm ? `${(lead.heightCm / 100).toFixed(2).replace('.', ',')} m` : ''
  const weightStr = lead.weightKg ? `${lead.weightKg} kg` : ''
  const dataLine = [birthStr, heightStr, weightStr].filter(Boolean).join(' | ')
  const clubStr = (lead.club || '').toUpperCase()

  // 4. Call createTask endpoint
  const createTaskUrl = 'https://api.kie.ai/api/v1/jobs/createTask'
  const prompt = [
    `Use the first image as the sticker card template and the second image as the person's photo.`,
    `Replace the white silhouette area in the template with the face and upper body of the person from the second image, keeping their likeness realistic.`,
    `Keep the entire template layout, colors, logo, flag and decorative elements exactly as they are — do not alter any other part of the card.`,
    `In the dark-teal bottom strip of the card, replace the placeholder text with the following data, centered and in white bold text:`,
    `First line: "${name.toUpperCase()}"`,
    dataLine ? `Second line: "${dataLine}"` : '',
    clubStr ? `Third line (smaller): "${clubStr}"` : '',
    `Preserve the "STUDIO RETRATO" yellow badge in the bottom-right corner exactly as in the template.`,
    `Output the complete sticker card as a single image, portrait orientation, high resolution.`,
  ].filter(Boolean).join(' ')

  const payload = {
    model: 'gpt-image-2-image-to-image',
    input: {
      prompt,
      input_urls: [publicTemplateUrl, publicInputUrl],
      resolution: '1K',
      aspect_ratio: '3:4'
    }
  }

  console.log(`[Kie AI Service] Creating task for model 'gpt-image-2-image-to-image' with 1K resolution...`)
  const createRes = await fetch(createTaskUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!createRes.ok) {
    const errorText = await createRes.text()
    throw new Error(`Failed to create Kie AI task: ${createRes.statusText} - ${errorText}`)
  }

  const createJson = await createRes.json()
  if (createJson.code !== 200 || !createJson.data?.taskId) {
    throw new Error(`Kie AI API returned code ${createJson.code}: ${createJson.message || 'Unknown error'}`)
  }

  const taskId = createJson.data.taskId
  console.log(`[Kie AI Service] Task created successfully. Task ID: ${taskId}. Starting polling...`)

  // 3. Poll for results (recordInfo)
  // Modelo com 2 imagens pode levar até 6 minutos — 90 tentativas × 4s = 360s
  let generatedImageUrl = ''
  const maxAttempts = 90
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 4000))
    console.log(`[Kie AI Service] Polling task ${taskId} (Attempt ${attempt}/${maxAttempts})...`)

    const pollRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!pollRes.ok) {
      console.warn(`[Kie AI Service] Polling request failed with status: ${pollRes.status}`)
      continue
    }

    const pollJson = await pollRes.json()
    if (pollJson.code !== 200) {
      throw new Error(`Kie AI API returned polling code ${pollJson.code}: ${pollJson.message}`)
    }

    const state = pollJson.data?.state
    console.log(`[Kie AI Service] Task state: ${state}`)

    if (state === 'success') {
      const resultJson = JSON.parse(pollJson.data.resultJson || '{}')
      generatedImageUrl = resultJson.resultUrls?.[0] || ''
      if (!generatedImageUrl) {
        throw new Error('Kie AI response succeeded but no resultUrls were found in resultJson')
      }
      break
    } else if (state === 'fail') {
      throw new Error(`Kie AI task failed: ${pollJson.data?.failMsg || 'Unknown error'}`)
    }
  }

  if (!generatedImageUrl) {
    throw new Error(`Kie AI task ${taskId} timed out or did not return successfully.`)
  }

  console.log(`[Kie AI Service] Image generated successfully by Kie AI: ${generatedImageUrl}`)

  // 4. Download generated image to store it permanently (URLs expire after 24h)
  console.log(`[Kie AI Service] Downloading generated image from Kie AI...`)
  const imageFetchRes = await fetch(generatedImageUrl)
  if (!imageFetchRes.ok) {
    throw new Error(`Failed to download generated image from ${generatedImageUrl}: ${imageFetchRes.statusText}`)
  }

  const arrayBuffer = await imageFetchRes.arrayBuffer()
  const imageBuffer = Buffer.from(arrayBuffer)

  // 5. Upload to project storage provider
  const storageProvider = getStorageProvider()
  const fileExt = 'png'
  const newFileName = `ai_craque_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  
  console.log(`[Kie AI Service] Uploading generated image to storage provider...`)
  const permanentUrl = await storageProvider.uploadFile(imageBuffer, newFileName, 'image/png')
  console.log(`[Kie AI Service] Image permanently stored at: ${permanentUrl}`)

  return permanentUrl
}
