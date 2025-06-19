import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Parse multipart form
    const form = new formidable.IncomingForm({ keepExtensions: true, uploadDir: './public/uploads' })
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })
    // Extract fields
    const { title, content, audience } = data.fields
    let fileUrl = null
    if (data.files && data.files.file) {
      const file = Array.isArray(data.files.file) ? data.files.file[0] : data.files.file
      fileUrl = `/uploads/${file.newFilename}`
    }
    // Save to DB
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        audience,
        fileUrl,
      },
    })
    return NextResponse.json({ success: true, announcement })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement.' }, { status: 500 })
  }
} 