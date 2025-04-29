import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { bufferToBase64url } from '@/lib/webauthn'

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json()

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    // Get faculty's registered credential
    const credential = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId },
    })

    if (!credential) {
      return NextResponse.json(
        { error: 'No registered fingerprint found' },
        { status: 404 }
      )
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      allowCredentials: [{
        id: Buffer.from(credential.credentialId, 'base64url'),
        type: 'public-key',
        transports: ['internal'],
      }],
      userVerification: 'preferred',
    })

    // Convert challenge to base64url
    const challenge = bufferToBase64url(options.challenge as Buffer)
    options.challenge = challenge

    // Convert credential IDs to base64url
    options.allowCredentials = options.allowCredentials?.map(cred => ({
      ...cred,
      id: bufferToBase64url(cred.id as Buffer),
    }))

    console.log('Generated authentication options:', {
      ...options,
      allowCredentials: options.allowCredentials?.map(c => ({
        ...c,
        id: c.id.toString()
      }))
    })

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('Error in authentication:', error)
    return NextResponse.json(
      { error: 'Failed to start authentication' },
      { status: 500 }
    )
  }
} 