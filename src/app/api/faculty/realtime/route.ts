import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all faculty members
    const faculty = await prisma.facultyMember.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty data' },
      { status: 500 }
    )
  }
} 