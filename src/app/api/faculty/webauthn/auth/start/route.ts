import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

function bufferToBase64url(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json();
    
    // Fetch registered credentials for this faculty
    const creds = await prisma.facultyWebAuthnCredential.findMany({ where: { facultyId } });
    
    if (!creds.length) {
      return NextResponse.json(
        { error: 'No registered credentials found. Please set up your fingerprint first.' },
        { status: 404 }
      );
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      allowCredentials: creds.map(c => ({
        id: Buffer.from(c.credentialId, 'base64'),
        type: 'public-key',
      })),
      userVerification: 'preferred',
      rpID: 'localhost',
      timeout: 60000,
    });

    // Convert credential IDs to base64url for frontend
    options.allowCredentials = options.allowCredentials?.map(c => ({
      ...c,
      id: bufferToBase64url(c.id as Buffer),
    }));

    console.log('Generated auth options:', options);
    
    return NextResponse.json({ options });
  } catch (err: any) {
    console.error('Authentication start error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to start authentication' },
      { status: 400 }
    );
  }
} 