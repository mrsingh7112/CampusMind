import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    // Delete the test faculty member
    await prisma.facultyMember.deleteMany({
      where: {
        OR: [
          { email: 'test@faculty.com' },
          { tokenId: 'FAC123456' }
        ]
      }
    })
    
    return NextResponse.json({ success: true, message: 'Test data removed successfully' })
  } catch (error) {
    console.error('Error cleaning up test data:', error)
    return NextResponse.json({ error: 'Failed to clean up test data' }, { status: 500 })
  }
} 