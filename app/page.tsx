export const dynamic = 'force-dynamic';

import { CompanyCard } from '@/components/company-card';
import { getFirmDashboard } from '@/lib/dashboard';

const fallbackFirmId = process.env.NEXT_PUBLIC_FIRM_ID;

export default async function HomePage() {
  if (!fallbackFirmId) {
    return (
      <section className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h1 className="mb-2 text-xl font-semibold">Configure your tenant context</h1>
        <p>Set NEXT_PUBLIC_FIRM_ID in your environment to view the workspace dashboard.</p>
      </section>
    );
  }

  const dashboard = await getFirmDashboard(fallbackFirmId);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Accounting firm workspace</h1>
        <p className="text-slate-600">Monitor client companies, tax deadlines, notes, and reminders in one portal.</p>
      </header>

      {dashboard.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">No companies found for this firm.</div>
      ) : (
        dashboard.map((company) => <CompanyCard key={company.id} company={company} />)
      )}
    </section>
  );
}
