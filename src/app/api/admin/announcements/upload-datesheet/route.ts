import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const fileName = formData.get('name') || `datesheet_${Date.now()}.pdf`;
    const destDir = path.join(process.cwd(), 'public', 'datesheets');
    await fs.mkdir(destDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const destPath = path.join(destDir, fileName.toString());
    await fs.writeFile(destPath, buffer);
    const publicUrl = `/datesheets/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
} 