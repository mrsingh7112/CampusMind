import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

// Function to generate permanent faculty token
function generatePermanentFacultyToken() {
  const prefix = 'PFAC'
  const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit number
  return `${prefix}${randomNum}`
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const permanentToken = generatePermanentFacultyToken()

    const user = await prisma.user.update({
      where: {
        id: params.id,
        role: 'FACULTY',
      },
      data: {
        tokenId: permanentToken,
      },
    })

    // Here you would typically send an email to the faculty member
    // with their permanent token ID
    // For now, we'll just return it in the response
    return NextResponse.json({
      message: 'Token generated and sent successfully',
      token: permanentToken,
    })
  } catch (error) {
    console.error('Error sending token:', error)
    return NextResponse.json(
      { error: 'Error sending token' },
      { status: 500 }
    )
  }
} 