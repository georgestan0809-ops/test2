import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { canManageCompanies } from '@/lib/authz';
import { prisma } from '@/lib/prisma';

const companySchema = z.object({
  firmId: z.string().min(1),
  legalName: z.string().min(2),
  taxId: z.string().min(2),
  billingEmail: z.string().email(),
  isVatPayer: z.boolean().default(true)
});

const parseRole = (req: NextRequest): UserRole => (req.headers.get('x-role') as UserRole) || 'CLIENT';

export async function POST(req: NextRequest) {
  const role = parseRole(req);

  if (!canManageCompanies(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const parsed = companySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const company = await prisma.company.create({ data: parsed.data });
  return NextResponse.json(company, { status: 201 });
}
