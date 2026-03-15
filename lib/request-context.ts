import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CurrentUser } from '@/lib/types';

export const getCurrentUser = async (req: NextRequest): Promise<CurrentUser | null> => {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firmId: true, role: true, isActive: true }
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    firmId: user.firmId,
    role: user.role
  };
};
