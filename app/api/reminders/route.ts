import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { canCreateAssignments } from '@/lib/authz';
import { getBoss, REMINDER_JOB_NAME } from '@/lib/jobs';
import { prisma } from '@/lib/prisma';

const reminderSchema = z.object({
  firmId: z.string().min(1),
  companyId: z.string().min(1),
  ownerId: z.string().min(1),
  title: z.string().min(2),
  message: z.string().min(2),
  scheduledAt: z.string().datetime(),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'IN_APP']).default('IN_APP')
});

const parseRole = (req: NextRequest): UserRole => (req.headers.get('x-role') as UserRole) || 'CLIENT';

export async function POST(req: NextRequest) {
  const role = parseRole(req);
  if (!canCreateAssignments(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = reminderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt)
    }
  });

  const boss = await getBoss();
  await boss.send(REMINDER_JOB_NAME, { reminderId: reminder.id }, { startAfter: reminder.scheduledAt });

  return NextResponse.json(reminder, { status: 201 });
}
