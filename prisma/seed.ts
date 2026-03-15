import { AssignmentStatus, ComplianceStatus, PrismaClient, ReminderChannel, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFirmA() {
  const firm = await prisma.firm.create({
    data: {
      name: 'Contab Expert SRL'
    }
  });

  const [owner, manager, accountant, analyst] = await prisma.$transaction([
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Andrei Popescu', email: 'owner@contab.ro', role: UserRole.OWNER } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Maria Ionescu', email: 'manager@contab.ro', role: UserRole.MANAGER } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Ioana Matei', email: 'accountant@contab.ro', role: UserRole.ACCOUNTANT } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Vlad Ene', email: 'analyst@contab.ro', role: UserRole.ANALYST } })
  ]);

  const [alfa, beta] = await prisma.$transaction([
    prisma.company.create({
      data: {
        firmId: firm.id,
        legalName: 'Alfa Construct SRL',
        taxId: 'RO12345678',
        billingEmail: 'office@alfaconstruct.ro',
        collectionLead: 12
      }
    }),
    prisma.company.create({
      data: {
        firmId: firm.id,
        legalName: 'Beta Logistics SA',
        taxId: 'RO87654321',
        billingEmail: 'finance@betalogistics.ro',
        collectionLead: 4
      }
    })
  ]);

  await prisma.$transaction([
    prisma.complianceMetric.create({
      data: {
        companyId: alfa.id,
        periodLabel: '2026-03',
        invoicesStatus: ComplianceStatus.ON_TRACK,
        collectionsStatus: ComplianceStatus.AT_RISK,
        eFacturaStatus: ComplianceStatus.ON_TRACK,
        safTStatus: ComplianceStatus.AT_RISK,
        taxDeadlineStatus: ComplianceStatus.OVERDUE
      }
    }),
    prisma.complianceMetric.create({
      data: {
        companyId: beta.id,
        periodLabel: '2026-03',
        invoicesStatus: ComplianceStatus.ON_TRACK,
        collectionsStatus: ComplianceStatus.ON_TRACK,
        eFacturaStatus: ComplianceStatus.ON_TRACK,
        safTStatus: ComplianceStatus.ON_TRACK,
        taxDeadlineStatus: ComplianceStatus.AT_RISK
      }
    })
  ]);

  await prisma.note.createMany({
    data: [
      {
        firmId: firm.id,
        companyId: alfa.id,
        authorId: manager.id,
        title: 'Need updated supplier contracts',
        body: 'Client should upload missing contracts in portal before SAF-T extraction.',
        isPinned: true
      },
      {
        firmId: firm.id,
        companyId: beta.id,
        authorId: analyst.id,
        title: 'Monitor overdue invoices',
        body: 'Top three clients are over 45 days delayed. Follow-up call required.',
        isPinned: false
      }
    ]
  });

  await prisma.assignment.createMany({
    data: [
      {
        firmId: firm.id,
        companyId: alfa.id,
        assigneeId: accountant.id,
        title: 'Prepare D394',
        description: 'Reconcile invoices and submit D394 draft for review.',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        status: AssignmentStatus.IN_PROGRESS
      },
      {
        firmId: firm.id,
        companyId: beta.id,
        assigneeId: analyst.id,
        title: 'Cashflow variance analysis',
        description: 'Compare monthly cashflow variance against Q1 forecast.',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        status: AssignmentStatus.TODO
      }
    ]
  });

  await prisma.reminder.createMany({
    data: [
      {
        firmId: firm.id,
        companyId: alfa.id,
        ownerId: accountant.id,
        title: 'VAT return deadline',
        message: 'Confirm VAT return submission by 25th.',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        channel: ReminderChannel.EMAIL
      },
      {
        firmId: firm.id,
        companyId: beta.id,
        ownerId: owner.id,
        title: 'Management reporting package',
        message: 'Share monthly management report with client CFO.',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        channel: ReminderChannel.IN_APP
      }
    ]
  });

  return { firmId: firm.id, demoUserId: manager.id };
}

async function seedFirmB() {
  const firm = await prisma.firm.create({
    data: {
      name: 'Nordic Ledger Consulting'
    }
  });

  const [owner, accountant] = await prisma.$transaction([
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Elena Stoica', email: 'owner@nordic-ledger.ro', role: UserRole.OWNER } }),
    prisma.user.create({ data: { firmId: firm.id, fullName: 'Rares Munteanu', email: 'accountant@nordic-ledger.ro', role: UserRole.ACCOUNTANT } })
  ]);

  const company = await prisma.company.create({
    data: {
      firmId: firm.id,
      legalName: 'Gamma Retail SRL',
      taxId: 'RO99887766',
      billingEmail: 'admin@gammaretail.ro',
      collectionLead: 18
    }
  });

  await prisma.complianceMetric.create({
    data: {
      companyId: company.id,
      periodLabel: '2026-03',
      invoicesStatus: ComplianceStatus.AT_RISK,
      collectionsStatus: ComplianceStatus.OVERDUE,
      eFacturaStatus: ComplianceStatus.ON_TRACK,
      safTStatus: ComplianceStatus.AT_RISK,
      taxDeadlineStatus: ComplianceStatus.AT_RISK
    }
  });

  await prisma.reminder.create({
    data: {
      firmId: firm.id,
      companyId: company.id,
      ownerId: owner.id,
      title: 'Payroll cutoff reminder',
      message: 'Collect finalized payroll changes by Monday 16:00.',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      channel: ReminderChannel.WHATSAPP
    }
  });

  await prisma.assignment.create({
    data: {
      firmId: firm.id,
      companyId: company.id,
      assigneeId: accountant.id,
      title: 'Review stock valuation',
      description: 'Validate stock valuation method for month-end closing.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      status: AssignmentStatus.TODO
    }
  });
}

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.complianceMetric.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  const firmA = await seedFirmA();
  await seedFirmB();

  console.log(`Seed complete.`);
  console.log(`DEFAULT_FIRM_ID=${firmA.firmId}`);
  console.log(`DEMO_MANAGER_USER_ID=${firmA.demoUserId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
