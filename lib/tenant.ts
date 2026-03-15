import { headers } from 'next/headers';

const FALLBACK_FIRM_ENV_KEYS = ['DEFAULT_FIRM_ID', 'NEXT_PUBLIC_FIRM_ID'] as const;

export const getViewerFirmId = () => {
  const headerStore = headers();
  const headerFirmId = headerStore.get('x-firm-id');

  if (headerFirmId) {
    return headerFirmId;
  }

  for (const key of FALLBACK_FIRM_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return null;
};
