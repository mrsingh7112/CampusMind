import { NextResponse } from 'next/server'

// In-memory fees store (replace with DB model if available)
let feesStore: Record<string, any[]> = {}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(feesStore[params.id] || [])
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type, amount, status } = await request.json()
    const fee = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount: parseFloat(amount),
      status,
    }
    if (!feesStore[params.id]) feesStore[params.id] = []
    feesStore[params.id].push(fee)
    return NextResponse.json(fee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add fee' },
      { status: 500 }
    )
  }
} 