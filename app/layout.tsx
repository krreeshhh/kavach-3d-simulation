import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KAVACH — 3D Cyber-Physical Simulation',
  description: 'Interactive Industrial Cyber-Physical Security Simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-screen h-screen overflow-hidden bg-[#f8fafc] text-slate-900 select-none">
        {children}
      </body>
    </html>
  );
}
