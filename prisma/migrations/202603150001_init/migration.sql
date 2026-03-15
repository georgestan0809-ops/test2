-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'AUDITOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'LEFT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "CollectionCaseStatus" AS ENUM ('OPEN', 'IN_NEGOTIATION', 'ESCALATED', 'RESOLVED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "EFacturaStatus" AS ENUM ('QUEUED', 'SENT', 'ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "SaftProjectStatus" AS ENUM ('PLANNED', 'COLLECTING_DATA', 'VALIDATING', 'SUBMITTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TaxDeadlineStatus" AS ENUM ('UPCOMING', 'SUBMITTED', 'MISSED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'IN_APP');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM', 'API');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingFirm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingFirm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCompany" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "taxId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "billingEmail" TEXT,
    "isVatPayer" BOOLEAN NOT NULL DEFAULT true,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartBillConnection" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "companyVatCode" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tokenLast4" TEXT NOT NULL,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartBillConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "externalId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "reference" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionCase" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "status" "CollectionCaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notesSummary" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EFacturaCheck" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "status" "EFacturaStatus" NOT NULL DEFAULT 'QUEUED',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseCode" TEXT,
    "responseMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EFacturaCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaftProject" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "status" "SaftProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "validationScore" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaftProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxDeadline" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "TaxDeadlineStatus" NOT NULL DEFAULT 'UPCOMING',
    "submittedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'TODO',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "channel" "ReminderChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
    "sentAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'USER',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "AccountingFirm_deletedAt_idx" ON "AccountingFirm"("deletedAt");

-- CreateIndex
CREATE INDEX "Membership_firmId_role_status_idx" ON "Membership"("firmId", "role", "status");

-- CreateIndex
CREATE INDEX "Membership_userId_status_idx" ON "Membership"("userId", "status");

-- CreateIndex
CREATE INDEX "Membership_deletedAt_idx" ON "Membership"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_firmId_key" ON "Membership"("userId", "firmId");

-- CreateIndex
CREATE INDEX "ClientCompany_firmId_legalName_idx" ON "ClientCompany"("firmId", "legalName");

-- CreateIndex
CREATE INDEX "ClientCompany_firmId_deletedAt_idx" ON "ClientCompany"("firmId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompany_firmId_taxId_key" ON "ClientCompany"("firmId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartBillConnection_clientCompanyId_key" ON "SmartBillConnection"("clientCompanyId");

-- CreateIndex
CREATE INDEX "SmartBillConnection_firmId_syncEnabled_idx" ON "SmartBillConnection"("firmId", "syncEnabled");

-- CreateIndex
CREATE INDEX "SmartBillConnection_firmId_deletedAt_idx" ON "SmartBillConnection"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_firmId_status_dueDate_idx" ON "Invoice"("firmId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_clientCompanyId_issueDate_idx" ON "Invoice"("clientCompanyId", "issueDate");

-- CreateIndex
CREATE INDEX "Invoice_firmId_deletedAt_idx" ON "Invoice"("firmId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_firmId_number_key" ON "Invoice"("firmId", "number");

-- CreateIndex
CREATE INDEX "Payment_firmId_paidAt_idx" ON "Payment"("firmId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_firmId_deletedAt_idx" ON "Payment"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "CollectionCase_firmId_status_priority_idx" ON "CollectionCase"("firmId", "status", "priority");

-- CreateIndex
CREATE INDEX "CollectionCase_clientCompanyId_status_idx" ON "CollectionCase"("clientCompanyId", "status");

-- CreateIndex
CREATE INDEX "CollectionCase_firmId_deletedAt_idx" ON "CollectionCase"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "EFacturaCheck_firmId_status_checkedAt_idx" ON "EFacturaCheck"("firmId", "status", "checkedAt");

-- CreateIndex
CREATE INDEX "EFacturaCheck_clientCompanyId_checkedAt_idx" ON "EFacturaCheck"("clientCompanyId", "checkedAt");

-- CreateIndex
CREATE INDEX "SaftProject_firmId_status_dueDate_idx" ON "SaftProject"("firmId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "SaftProject_firmId_deletedAt_idx" ON "SaftProject"("firmId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SaftProject_clientCompanyId_periodLabel_key" ON "SaftProject"("clientCompanyId", "periodLabel");

-- CreateIndex
CREATE INDEX "TaxDeadline_firmId_dueDate_status_idx" ON "TaxDeadline"("firmId", "dueDate", "status");

-- CreateIndex
CREATE INDEX "TaxDeadline_clientCompanyId_dueDate_idx" ON "TaxDeadline"("clientCompanyId", "dueDate");

-- CreateIndex
CREATE INDEX "TaxDeadline_firmId_deletedAt_idx" ON "TaxDeadline"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "Note_firmId_clientCompanyId_createdAt_idx" ON "Note"("firmId", "clientCompanyId", "createdAt");

-- CreateIndex
CREATE INDEX "Note_firmId_deletedAt_idx" ON "Note"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "Assignment_firmId_status_dueDate_idx" ON "Assignment"("firmId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Assignment_assigneeId_status_dueDate_idx" ON "Assignment"("assigneeId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Assignment_firmId_deletedAt_idx" ON "Assignment"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "Reminder_firmId_status_scheduledAt_idx" ON "Reminder"("firmId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Reminder_ownerId_status_scheduledAt_idx" ON "Reminder"("ownerId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Reminder_firmId_deletedAt_idx" ON "Reminder"("firmId", "deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_firmId_createdAt_idx" ON "AuditLog"("firmId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartBillConnection" ADD CONSTRAINT "SmartBillConnection_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartBillConnection" ADD CONSTRAINT "SmartBillConnection_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionCase" ADD CONSTRAINT "CollectionCase_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionCase" ADD CONSTRAINT "CollectionCase_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionCase" ADD CONSTRAINT "CollectionCase_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EFacturaCheck" ADD CONSTRAINT "EFacturaCheck_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EFacturaCheck" ADD CONSTRAINT "EFacturaCheck_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EFacturaCheck" ADD CONSTRAINT "EFacturaCheck_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaftProject" ADD CONSTRAINT "SaftProject_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaftProject" ADD CONSTRAINT "SaftProject_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxDeadline" ADD CONSTRAINT "TaxDeadline_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxDeadline" ADD CONSTRAINT "TaxDeadline_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

