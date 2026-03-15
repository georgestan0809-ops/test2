import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canCreateAssignments } from '@/lib/authz';
import { getBoss, REMINDER_JOB_NAME } from '@/lib/jobs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/request-context';

const reminderSchema = z.object({
  companyId: z.string().min(1),
  ownerId: z.string().min(1),
  title: z.string().min(2),
  message: z.string().min(2),
  scheduledAt: z.string().datetime(),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'IN_APP']).default('IN_APP')
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canCreateAssignments(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = reminderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [company, owner] = await Promise.all([
    prisma.company.findFirst({
      where: { id: parsed.data.companyId, firmId: user.firmId },
      select: { id: true }
    }),
    prisma.user.findFirst({
      where: { id: parsed.data.ownerId, firmId: user.firmId, isActive: true },
      select: { id: true }
    })
  ]);

  if (!company) {
    return NextResponse.json({ error: 'Company not found for tenant' }, { status: 404 });
  }

  if (!owner) {
    return NextResponse.json({ error: 'Reminder owner is invalid for tenant' }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      ...parsed.data,
      firmId: user.firmId,
      scheduledAt: new Date(parsed.data.scheduledAt)
    }
  });

  const boss = await getBoss();
  await boss.send(REMINDER_JOB_NAME, { reminderId: reminder.id, firmId: reminder.firmId }, { startAfter: reminder.scheduledAt });

  return NextResponse.json(reminder, { status: 201 });
}
