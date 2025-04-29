import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.update({
      where: {
        id: params.id,
        role: 'FACULTY',
      },
      data: {
        approved: true,
      },
    })

    // Here you would typically send an email to the faculty member
    // with their permanent token ID

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Error approving user' },
      { status: 500 }
    )
  }
} 