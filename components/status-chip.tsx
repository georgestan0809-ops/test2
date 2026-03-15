import { ComplianceStatus } from '@prisma/client';

const statusClass: Record<ComplianceStatus, string> = {
  ON_TRACK: 'bg-green-100 text-green-800 border-green-200',
  AT_RISK: 'bg-amber-100 text-amber-800 border-amber-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200'
};

export const StatusChip = ({ label, status }: { label: string; status: ComplianceStatus }) => (
  <div className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClass[status]}`}>
    {label}: {status.replace('_', ' ')}
  </div>
);
