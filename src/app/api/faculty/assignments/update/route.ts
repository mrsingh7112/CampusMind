import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs';

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing assignment id' }, { status: 400 })

  const formData = await req.formData()
  const title = formData.get('title')
  const description = formData.get('description')
  const dueDate = formData.get('dueDate')
  const file = formData.get('file')

  if (!title || !description || !dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find assignment and check ownership
  const assignment = await prisma.assignment.findUnique({ where: { id } })
  if (!assignment || assignment.facultyId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  let fileUrl = null
  if (file && typeof file === 'object' && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assignments')
    await writeFile(
      path.join(uploadDir, file.name),
      buffer
    )
    fileUrl = `/uploads/assignments/${file.name}`
  }

  const updated = await prisma.assignment.update({
    where: { id },
    data: {
      title,
      description: fileUrl ? `${description}\n\n[Download PDF](${fileUrl})` : description,
      dueDate: new Date(dueDate)
    }
  })
  return NextResponse.json(updated)
} 