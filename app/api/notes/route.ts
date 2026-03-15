import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canCreateAssignments } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/request-context';

const noteSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(2),
  body: z.string().min(2),
  isPinned: z.boolean().default(false)
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canCreateAssignments(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = noteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: {
      id: parsed.data.companyId,
      firmId: user.firmId
    },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ error: 'Company not found for tenant' }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      firmId: user.firmId,
      authorId: user.id
    }
  });

  return NextResponse.json(note, { status: 201 });
}
