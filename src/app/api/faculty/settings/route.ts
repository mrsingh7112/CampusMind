import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET endpoint to fetch settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Get user settings from database
    const user = await prisma.user.findUnique({
      where: { id: facultyId },
      select: {
        theme: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      theme: user.theme || 'light',
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
      soundEnabled: user.soundEnabled ?? true
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Validate updates
    const validSettings = [
      'theme',
      'emailNotifications',
      'pushNotifications',
      'soundEnabled'
    ]

    const invalidSettings = Object.keys(updates).filter(
      key => !validSettings.includes(key)
    )

    if (invalidSettings.length > 0) {
      return NextResponse.json(
        { error: `Invalid settings: ${invalidSettings.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Update user settings
    const user = await prisma.user.update({
      where: { id: facultyId },
      data: updates,
      select: {
        theme: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true
      }
    })

    return NextResponse.json({
      theme: user.theme || 'light',
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
      soundEnabled: user.soundEnabled ?? true
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 