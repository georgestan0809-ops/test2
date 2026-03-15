export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StatusChip } from '@/components/status-chip';

export default async function CompanyPage({ params }: { params: { companyId: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.companyId },
    include: {
      metrics: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      assignments: { include: { assignee: true }, orderBy: { dueDate: 'asc' } },
      notes: { include: { author: true }, orderBy: { createdAt: 'desc' } },
      reminders: { where: { sentAt: null }, orderBy: { scheduledAt: 'asc' } }
    }
  });

  if (!company) {
    notFound();
  }

  const status = company.metrics[0];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{company.legalName}</h1>
        <p className="text-slate-600">Tax ID: {company.taxId}</p>
      </header>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <StatusChip label="Invoices" status={status?.invoicesStatus ?? 'ON_TRACK'} />
        <StatusChip label="Collections" status={status?.collectionsStatus ?? 'ON_TRACK'} />
        <StatusChip label="e-Factura" status={status?.eFacturaStatus ?? 'ON_TRACK'} />
        <StatusChip label="SAF-T" status={status?.safTStatus ?? 'ON_TRACK'} />
        <StatusChip label="Tax" status={status?.taxDeadlineStatus ?? 'ON_TRACK'} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Assignments</h2>
          <ul className="space-y-2 text-sm">
            {company.assignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.title} - {assignment.assignee.fullName} ({assignment.status})
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Internal notes</h2>
          <ul className="space-y-2 text-sm">
            {company.notes.map((note) => (
              <li key={note.id}>
                <p className="font-medium">{note.title}</p>
                <p>{note.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Upcoming reminders</h2>
        <ul className="space-y-2 text-sm">
          {company.reminders.map((reminder) => (
            <li key={reminder.id}>
              {reminder.title} - {new Date(reminder.scheduledAt).toLocaleString('ro-RO')} ({reminder.channel})
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
