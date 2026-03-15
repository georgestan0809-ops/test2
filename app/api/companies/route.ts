import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canManageCompanies } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/request-context';

const companySchema = z.object({
  legalName: z.string().min(2),
  taxId: z.string().min(2),
  billingEmail: z.string().email(),
  isVatPayer: z.boolean().default(true)
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canManageCompanies(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = companySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      ...parsed.data,
      firmId: user.firmId
    }
  });

  return NextResponse.json(company, { status: 201 });
}
