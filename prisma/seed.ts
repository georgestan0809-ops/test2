import { AssignmentStatus, ComplianceStatus, PrismaClient, ReminderChannel, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.complianceMetric.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  const firm = await prisma.firm.create({
    data: {
      name: 'Contab Expert SRL'
    }
  });

  const users = await prisma.$transaction([
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Andrei Popescu', email: 'owner@contab.ro', role: UserRole.OWNER } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Maria Ionescu', email: 'manager@contab.ro', role: UserRole.MANAGER } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Ioana Matei', email: 'accountant@contab.ro', role: UserRole.ACCOUNTANT } })
  ]);

  const company = await prisma.company.create({
    data: {
      firmId: firm.id,
      legalName: 'Alfa Construct SRL',
      taxId: 'RO12345678',
      billingEmail: 'office@alfaconstruct.ro',
      collectionLead: 12
    }
  });

  await prisma.complianceMetric.create({
    data: {
      companyId: company.id,
      periodLabel: '2026-03',
      invoicesStatus: ComplianceStatus.ON_TRACK,
      collectionsStatus: ComplianceStatus.AT_RISK,
      eFacturaStatus: ComplianceStatus.ON_TRACK,
      safTStatus: ComplianceStatus.AT_RISK,
      taxDeadlineStatus: ComplianceStatus.OVERDUE
    }
  });

  await prisma.note.create({
    data: {
      firmId: firm.id,
      companyId: company.id,
      authorId: users[1].id,
      title: 'Need updated supplier contracts',
      body: 'Client should upload missing contracts in portal before SAF-T extraction.',
      isPinned: true
    }
  });

  await prisma.assignment.create({
    data: {
      firmId: firm.id,
      companyId: company.id,
      assigneeId: users[2].id,
      title: 'Prepare D394',
      description: 'Reconcile invoices and submit D394 draft for review.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      status: AssignmentStatus.IN_PROGRESS
    }
  });

  await prisma.reminder.create({
    data: {
      firmId: firm.id,
      companyId: company.id,
      ownerId: users[2].id,
      title: 'VAT return deadline',
      message: 'Confirm VAT return submission by 25th.',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      channel: ReminderChannel.EMAIL
    }
  });

  console.log(`Seed done. Use NEXT_PUBLIC_FIRM_ID=${firm.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
