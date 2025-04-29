import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const charts = await prisma.dashboardChartData.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return NextResponse.json(charts)
  } catch (error) {
    console.error('Error fetching dashboard charts:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard charts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()
    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const chart = await prisma.dashboardChartData.create({
      data: { type, data },
    })
    return NextResponse.json({ success: true, data: chart })
  } catch (error) {
    console.error('Error creating dashboard chart:', error)
    return NextResponse.json({ error: 'Failed to create dashboard chart' }, { status: 500 })
  }
} 