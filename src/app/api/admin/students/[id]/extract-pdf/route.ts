import { NextResponse } from 'next/server'
import formidable from 'formidable'
import fs from 'fs/promises'
import fetch from 'node-fetch'

// Updated route segment config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Parse the incoming form data
    const form = new formidable.IncomingForm()
    const data: any = await new Promise((resolve, reject) => {
      form.parse(request as any, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })
    const file = data.files?.file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    // Read the PDF file
    const pdfBuffer = await fs.readFile(file.filepath)
    // Send to ML microservice
    const mlRes = await fetch('http://localhost:8000/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfBuffer,
    })
    const extracted = await mlRes.json()
    return NextResponse.json(extracted)
  } catch (error) {
    console.error('Error extracting PDF:', error)
    return NextResponse.json({ error: 'Failed to extract PDF' }, { status: 500 })
  }
} 