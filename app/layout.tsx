import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Romanian Accountant Portal',
  description: 'Multi-tenant workspace for Romanian accounting firms.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
