import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For now, return an empty array since the results feature is not implemented yet
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
} 