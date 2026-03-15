import {
  AssignmentStatus,
  AuditActorType,
  CollectionCaseStatus,
  EFacturaStatus,
  InvoiceStatus,
  MembershipRole,
  MembershipStatus,
  PaymentStatus,
  PrismaClient,
  ReminderChannel,
  ReminderStatus,
  SaftProjectStatus,
  TaxDeadlineStatus
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedFirmA() {
  const firm = await prisma.accountingFirm.create({
    data: {
      name: 'Contab Expert SRL'
    }
  });

  const [owner, manager, accountant, auditor] = await prisma.$transaction([
    prisma.user.create({ data: { fullName: 'Andrei Popescu', email: 'owner@contab.ro' } }),
    prisma.user.create({ data: { fullName: 'Maria Ionescu', email: 'manager@contab.ro' } }),
    prisma.user.create({ data: { fullName: 'Ioana Matei', email: 'accountant@contab.ro' } }),
    prisma.user.create({ data: { fullName: 'Vlad Ene', email: 'auditor@contab.ro' } })
  ]);

  await prisma.membership.createMany({
    data: [
      { userId: owner.id, firmId: firm.id, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
      { userId: manager.id, firmId: firm.id, role: MembershipRole.MANAGER, status: MembershipStatus.ACTIVE },
      { userId: accountant.id, firmId: firm.id, role: MembershipRole.ACCOUNTANT, status: MembershipStatus.ACTIVE },
      { userId: auditor.id, firmId: firm.id, role: MembershipRole.AUDITOR, status: MembershipStatus.ACTIVE }
    ]
  });

  const [alfa, beta] = await prisma.$transaction([
    prisma.clientCompany.create({
      data: {
        firmId: firm.id,
        legalName: 'Alfa Construct SRL',
        taxId: 'RO12345678',
        registrationNumber: 'J40/1234/2016',
        billingEmail: 'office@alfaconstruct.ro',
        riskScore: 68
      }
    }),
    prisma.clientCompany.create({
      data: {
        firmId: firm.id,
        legalName: 'Beta Logistics SA',
        taxId: 'RO87654321',
        registrationNumber: 'J40/5678/2018',
        billingEmail: 'finance@betalogistics.ro',
        riskScore: 35
      }
    })
  ]);

  await prisma.smartBillConnection.create({
    data: {
      firmId: firm.id,
      clientCompanyId: alfa.id,
      companyVatCode: 'RO12345678',
      username: 'alfa.api',
      tokenLast4: '8C1D',
      syncEnabled: true,
      lastSyncStatus: 'OK',
      lastSyncAt: new Date()
    }
  });

  const [invoiceA, invoiceB] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        number: 'INV-ALFA-0001',
        issueDate: new Date('2026-03-01T10:00:00Z'),
        dueDate: new Date('2026-03-15T10:00:00Z'),
        totalAmount: 12850,
        paidAmount: 5000,
        status: InvoiceStatus.PARTIALLY_PAID
      }
    }),
    prisma.invoice.create({
      data: {
        firmId: firm.id,
        clientCompanyId: beta.id,
        number: 'INV-BETA-0007',
        issueDate: new Date('2026-03-03T09:00:00Z'),
        dueDate: new Date('2026-03-28T09:00:00Z'),
        totalAmount: 7750,
        paidAmount: 0,
        status: InvoiceStatus.SENT
      }
    })
  ]);

  await prisma.payment.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        invoiceId: invoiceA.id,
        amount: 5000,
        paidAt: new Date('2026-03-10T10:00:00Z'),
        method: 'BANK_TRANSFER',
        status: PaymentStatus.CONFIRMED,
        reference: 'BT-2026-0310-ALFA'
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        invoiceId: invoiceB.id,
        amount: 7750,
        paidAt: new Date('2026-03-29T10:00:00Z'),
        method: 'BANK_TRANSFER',
        status: PaymentStatus.PENDING,
        reference: 'BT-2026-0329-BETA'
      }
    ]
  });

  await prisma.collectionCase.create({
    data: {
      firmId: firm.id,
      clientCompanyId: alfa.id,
      invoiceId: invoiceA.id,
      status: CollectionCaseStatus.IN_NEGOTIATION,
      priority: 4,
      notesSummary: 'Client requested staggered payment across two weeks.'
    }
  });

  await prisma.eFacturaCheck.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        invoiceId: invoiceA.id,
        status: EFacturaStatus.ACCEPTED,
        responseCode: '200',
        responseMessage: 'Accepted by ANAF.'
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        invoiceId: invoiceB.id,
        status: EFacturaStatus.SENT,
        responseCode: '102',
        responseMessage: 'Pending validation.'
      }
    ]
  });

  await prisma.saftProject.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        periodLabel: '2026-03',
        status: SaftProjectStatus.VALIDATING,
        dueDate: new Date('2026-04-25T00:00:00Z'),
        validationScore: 88
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        periodLabel: '2026-03',
        status: SaftProjectStatus.COLLECTING_DATA,
        dueDate: new Date('2026-04-25T00:00:00Z')
      }
    ]
  });

  await prisma.taxDeadline.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        label: 'D300 VAT Return',
        taxType: 'VAT',
        dueDate: new Date('2026-03-25T21:00:00Z'),
        status: TaxDeadlineStatus.UPCOMING
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        label: 'D112 Payroll',
        taxType: 'PAYROLL',
        dueDate: new Date('2026-03-25T21:00:00Z'),
        status: TaxDeadlineStatus.SUBMITTED,
        submittedAt: new Date('2026-03-20T12:30:00Z')
      }
    ]
  });

  await prisma.note.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        authorId: manager.id,
        title: 'Need updated supplier contracts',
        body: 'Client should upload missing contracts before SAF-T extraction.',
        isPinned: true
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        authorId: auditor.id,
        title: 'Monitor overdue invoices',
        body: 'Top three customers are over 45 days delayed. Follow-up call required.',
        isPinned: false
      }
    ]
  });

  await prisma.assignment.createMany({
    data: [
      {
        firmId: firm.id,
        clientCompanyId: alfa.id,
        assigneeId: accountant.id,
        title: 'Prepare D394',
        description: 'Reconcile invoices and submit D394 draft for review.',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        status: AssignmentStatus.IN_PROGRESS
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        assigneeId: manager.id,
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
        clientCompanyId: alfa.id,
        ownerId: accountant.id,
        title: 'VAT return deadline',
        message: 'Confirm VAT return submission by 25th.',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        channel: ReminderChannel.EMAIL,
        status: ReminderStatus.SCHEDULED
      },
      {
        firmId: firm.id,
        clientCompanyId: beta.id,
        ownerId: owner.id,
        title: 'Management reporting package',
        message: 'Share monthly management report with client CFO.',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        channel: ReminderChannel.IN_APP,
        status: ReminderStatus.SCHEDULED
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        firmId: firm.id,
        actorId: owner.id,
        actorType: AuditActorType.USER,
        action: 'CREATE_CLIENT_COMPANY',
        entityType: 'ClientCompany',
        entityId: alfa.id,
        meta: { source: 'seed' }
      },
      {
        firmId: firm.id,
        actorId: manager.id,
        actorType: AuditActorType.USER,
        action: 'CREATE_ASSIGNMENT',
        entityType: 'Assignment',
        entityId: 'seed-batch',
        meta: { source: 'seed' }
      }
    ]
  });

  return { firmId: firm.id, demoUserId: manager.id };
}

async function seedFirmB(sharedAuditorEmail: string) {
  const firm = await prisma.accountingFirm.create({
    data: {
      name: 'Nordic Ledger Consulting'
    }
  });

  const [owner, accountant, sharedAuditor] = await prisma.$transaction([
    prisma.user.create({ data: { fullName: 'Elena Stoica', email: 'owner@nordic-ledger.ro' } }),
    prisma.user.create({ data: { fullName: 'Rares Munteanu', email: 'accountant@nordic-ledger.ro' } }),
    prisma.user.findUniqueOrThrow({ where: { email: sharedAuditorEmail } })
  ]);

  await prisma.membership.createMany({
    data: [
      { userId: owner.id, firmId: firm.id, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
      { userId: accountant.id, firmId: firm.id, role: MembershipRole.ACCOUNTANT, status: MembershipStatus.ACTIVE },
      { userId: sharedAuditor.id, firmId: firm.id, role: MembershipRole.AUDITOR, status: MembershipStatus.ACTIVE }
    ]
  });

  const company = await prisma.clientCompany.create({
    data: {
      firmId: firm.id,
      legalName: 'Gamma Retail SRL',
      taxId: 'RO99887766',
      registrationNumber: 'J40/9988/2017',
      billingEmail: 'admin@gammaretail.ro',
      riskScore: 82
    }
  });

  await prisma.taxDeadline.create({
    data: {
      firmId: firm.id,
      clientCompanyId: company.id,
      label: 'D300 VAT Return',
      taxType: 'VAT',
      dueDate: new Date('2026-03-25T21:00:00Z'),
      status: TaxDeadlineStatus.MISSED
    }
  });

  await prisma.reminder.create({
    data: {
      firmId: firm.id,
      clientCompanyId: company.id,
      ownerId: owner.id,
      title: 'Payroll cutoff reminder',
      message: 'Collect finalized payroll changes by Monday 16:00.',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      channel: ReminderChannel.WHATSAPP,
      status: ReminderStatus.SCHEDULED
    }
  });

  await prisma.assignment.create({
    data: {
      firmId: firm.id,
      clientCompanyId: company.id,
      assigneeId: accountant.id,
      title: 'Review stock valuation',
      description: 'Validate stock valuation method for month-end closing.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      status: AssignmentStatus.TODO
    }
  });
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.taxDeadline.deleteMany();
  await prisma.saftProject.deleteMany();
  await prisma.eFacturaCheck.deleteMany();
  await prisma.collectionCase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.smartBillConnection.deleteMany();
  await prisma.clientCompany.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.accountingFirm.deleteMany();
  await prisma.user.deleteMany();

  const firmA = await seedFirmA();
  await seedFirmB('auditor@contab.ro');

  console.log('Seed complete.');
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
