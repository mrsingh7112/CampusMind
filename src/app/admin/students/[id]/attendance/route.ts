import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) throw new Error('Prisma client is not initialized')
    if (!params.id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const attendance = await prisma.attendance.findMany({
      where: { 
        studentId: params.id,
        subject: {
          isNot: null
        }
      },
      include: { 
        subject: { 
          select: { 
            name: true,
            code: true
          } 
        } 
      },
      orderBy: { 
        date: 'desc' 
      },
    })

    // Calculate attendance statistics
    const total = attendance.length
    const present = attendance.filter(a => a.isPresent).length
    const absent = total - present
    const attendancePercentage = total > 0 ? (present / total) * 100 : 0

    return NextResponse.json({
      records: Array.isArray(attendance) ? attendance : [],
      stats: {
        total,
        present,
        absent,
        percentage: Math.round(attendancePercentage * 10) / 10
      }
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { records: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 }, error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
} 