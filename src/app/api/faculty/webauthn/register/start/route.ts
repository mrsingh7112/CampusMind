import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

function bufferToBase64url(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(request: Request) {
  try {
    const { facultyId, name } = await request.json();
    console.log('Received registration start request:', { facultyId, name });

    // Check for existing credential
    const existingCred = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId }
    });

    if (existingCred) {
      return NextResponse.json({ 
        error: 'Fingerprint already registered. Please use Reset Fingerprint if you want to register a new one.' 
      }, { status: 400 });
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: 'CampusMind',
      userID: Buffer.from(facultyId, 'utf-8'),
      userName: name,
      attestationType: 'none',
      authenticatorSelection: { 
        userVerification: 'preferred',
        residentKey: 'preferred',
        authenticatorAttachment: 'platform' // Prefer platform authenticator (like TouchID)
      },
    });

    // Encode user.id as base64url string for frontend compatibility
    if (options.user && Buffer.isBuffer(options.user.id)) {
      options.user.id = bufferToBase64url(options.user.id);
    }

    console.log('Generated registration options:', options);
    return NextResponse.json({ options });
  } catch (err: any) {
    console.error('Registration start error:', err);
    return NextResponse.json({ error: err.message || 'Failed to start registration' }, { status: 400 });
  }
} 