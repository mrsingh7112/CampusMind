import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // Fallback body parsing if needed
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk });
        req.on('end', () => resolve(JSON.parse(data)));
      });
    }
    console.log('Password API body:', body);
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { currentPassword, newPassword, confirmPassword } = body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: session.user.id },
      data: { password: hashed }
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error changing admin password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 