import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { canCreateAssignments } from '@/lib/authz';
import { prisma } from '@/lib/prisma';

const noteSchema = z.object({
  firmId: z.string().min(1),
  companyId: z.string().min(1),
  authorId: z.string().min(1),
  title: z.string().min(2),
  body: z.string().min(2),
  isPinned: z.boolean().default(false)
});

const parseRole = (req: NextRequest): UserRole => (req.headers.get('x-role') as UserRole) || 'CLIENT';

export async function POST(req: NextRequest) {
  const role = parseRole(req);

  if (!canCreateAssignments(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = noteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = await prisma.note.create({ data: parsed.data });
  return NextResponse.json(note, { status: 201 });
}
