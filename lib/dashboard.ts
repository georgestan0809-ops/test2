import { prisma } from '@/lib/prisma';
import { CompanyDashboardDTO } from '@/lib/types';

export const getFirmDashboard = async (firmId: string): Promise<CompanyDashboardDTO[]> => {
  const companies = await prisma.company.findMany({
    where: { firmId },
    include: {
      metrics: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      assignments: {
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          assignee: true
        }
      },
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          author: true
        }
      },
      reminders: {
        where: { sentAt: null },
        orderBy: { scheduledAt: 'asc' },
        take: 5
      }
    }
  });

  return companies.map((company) => {
    const latestMetric = company.metrics[0];

    return {
      id: company.id,
      legalName: company.legalName,
      taxId: company.taxId,
      collectionLead: company.collectionLead,
      status: {
        invoices: latestMetric?.invoicesStatus ?? 'ON_TRACK',
        collections: latestMetric?.collectionsStatus ?? 'ON_TRACK',
        eFactura: latestMetric?.eFacturaStatus ?? 'ON_TRACK',
        safT: latestMetric?.safTStatus ?? 'ON_TRACK',
        taxes: latestMetric?.taxDeadlineStatus ?? 'ON_TRACK'
      },
      assignments: company.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        status: assignment.status,
        assigneeName: assignment.assignee.fullName
      })),
      notes: company.notes.map((note) => ({
        id: note.id,
        title: note.title,
        body: note.body,
        authorName: note.author.fullName
      })),
      reminders: company.reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        scheduledAt: reminder.scheduledAt,
        channel: reminder.channel
      }))
    };
  });
};
