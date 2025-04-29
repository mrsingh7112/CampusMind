import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts from all relevant tables
    const facultyCount = await prisma.facultyMember.count()
    const facultyMembers = await prisma.facultyMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        createdAt: true
      }
    })
    
    const studentCount = await prisma.studentMember.count()
    const departmentCount = await prisma.department.count()
    
    return NextResponse.json({
      counts: {
        faculty: facultyCount,
        students: studentCount,
        departments: departmentCount
      },
      facultyMembers: facultyMembers
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({ error: 'Failed to check database' }, { status: 500 })
  }
} 