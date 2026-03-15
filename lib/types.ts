import { AssignmentStatus, ComplianceStatus, ReminderChannel, UserRole } from '@prisma/client';

export type CompanyDashboardDTO = {
  id: string;
  legalName: string;
  taxId: string;
  collectionLead: number;
  status: {
    invoices: ComplianceStatus;
    collections: ComplianceStatus;
    eFactura: ComplianceStatus;
    safT: ComplianceStatus;
    taxes: ComplianceStatus;
  };
  assignments: {
    id: string;
    title: string;
    dueDate: Date;
    status: AssignmentStatus;
    assigneeName: string;
  }[];
  notes: {
    id: string;
    title: string;
    body: string;
    authorName: string;
  }[];
  reminders: {
    id: string;
    title: string;
    scheduledAt: Date;
    channel: ReminderChannel;
  }[];
};

export type CurrentUser = {
  id: string;
  firmId: string;
  role: UserRole;
};
