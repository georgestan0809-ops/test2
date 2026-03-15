import Link from 'next/link';
import { CompanyDashboardDTO } from '@/lib/types';
import { StatusChip } from '@/components/status-chip';

export const CompanyCard = ({ company }: { company: CompanyDashboardDTO }) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{company.legalName}</h2>
          <p className="text-sm text-slate-500">CUI: {company.taxId}</p>
        </div>
        <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href={`/companies/${company.id}`}>
          Open workspace
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
        <StatusChip label="Invoices" status={company.status.invoices} />
        <StatusChip label="Collections" status={company.status.collections} />
        <StatusChip label="e-Factura" status={company.status.eFactura} />
        <StatusChip label="SAF-T" status={company.status.safT} />
        <StatusChip label="Taxes" status={company.status.taxes} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Assignments</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {company.assignments.length === 0 && <li>No assignments.</li>}
            {company.assignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.title} · {assignment.assigneeName}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Internal notes</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {company.notes.length === 0 && <li>No internal notes.</li>}
            {company.notes.map((note) => (
              <li key={note.id}>
                <p className="font-medium">{note.title}</p>
                <p className="line-clamp-2">{note.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Reminders</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {company.reminders.length === 0 && <li>No scheduled reminders.</li>}
            {company.reminders.map((reminder) => (
              <li key={reminder.id}>
                {reminder.title} · {new Date(reminder.scheduledAt).toLocaleDateString('ro-RO')}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
};
