import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

function bufferToBase64url(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(request: Request) {
  try {
    const { facultyId, attestationResponse, expectedChallenge } = await request.json();

    // Check if faculty already has a credential
    const existingCred = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId }
    });

    if (existingCred) {
      return NextResponse.json(
        { error: 'Faculty already has a registered fingerprint. Please delete the existing one first.' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const { credentialID, credentialPublicKey } = verification.registrationInfo!;

    // Store credential using URL-safe Base64
    await prisma.facultyWebAuthnCredential.create({
      data: {
        facultyId,
        credentialId: bufferToBase64url(Buffer.from(credentialID)),
        publicKey: bufferToBase64url(Buffer.from(credentialPublicKey)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Registration finish error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 400 });
  }
} 