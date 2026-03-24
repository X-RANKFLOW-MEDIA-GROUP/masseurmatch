"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

const legalNav = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/therapist-agreement", label: "Therapist Agreement" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/billing-policy", label: "Billing & Refunds" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/photo-policy", label: "Photo Policy" },
  { href: "/dmca", label: "DMCA" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/legal-contact", label: "Legal Contact" },
];

export default function LegalPageLayout({ title, lastUpdated = "March 10, 2026", children }: LegalPageLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar de Navegação */}
        <aside className="md:w-72 flex-shrink-0">
          <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Busca Interna */}
            <div className="relative mb-6">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input 
                type="text" 
                placeholder="Search legal docs..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                // Not wired up yet
              />
            </div>
            <nav className="space-y-2">
              {legalNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Conteúdo Legal */}
        <main className="flex-1 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-500 mb-8 border-b pb-4">Last Updated: {lastUpdated}</p>
          <div className="prose prose-gray max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
