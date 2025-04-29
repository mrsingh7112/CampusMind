import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

function bufferToBase64url(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(request: Request) {
  try {
    const { facultyId, assertionResponse, expectedChallenge } = await request.json();
    console.log('Auth finish request:', { facultyId, assertionResponse, expectedChallenge });

    // Get all credentials for this faculty
    const creds = await prisma.facultyWebAuthnCredential.findMany({
      where: { facultyId }
    });

    console.log('Found credentials:', creds.map(c => ({
      id: c.id,
      credentialId: c.credentialId
    })));

    // Find the matching credential
    const cred = creds.find(c => {
      const storedId = c.credentialId
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const receivedId = assertionResponse.id;
      console.log('Comparing credentials:', {
        stored: storedId,
        received: receivedId,
        match: storedId === receivedId
      });
      return storedId === receivedId;
    });

    if (!cred) {
      console.error('Credential not found:', {
        facultyId,
        credentialId: assertionResponse.id,
        availableCredentials: creds.map(c => c.credentialId)
      });
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response: assertionResponse,
        expectedChallenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        authenticator: {
          credentialID: Buffer.from(cred.credentialId, 'base64'),
          credentialPublicKey: Buffer.from(cred.publicKey, 'base64'),
          counter: 0,
        },
        requireUserVerification: true,
      });

      console.log('Verification result:', verification);

      if (!verification.verified) {
        return NextResponse.json({ error: 'Authentication verification failed' }, { status: 400 });
      }

      // Mark attendance
      const now = new Date();
      await prisma.facultyAttendance.create({
        data: {
          facultyId,
          date: now,
          time: now,
        },
      });

      return NextResponse.json({ success: true });
    } catch (verifyError: any) {
      console.error('Verification error:', verifyError);
      return NextResponse.json({
        error: `Verification error: ${verifyError.message}`,
        details: verifyError.stack
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Authentication finish error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 400 });
  }
} 