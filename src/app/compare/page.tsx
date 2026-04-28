
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Compare Massage Directories | MasseurMatch',
  description: 'See why MasseurMatch is the safest and most trusted alternative to RentMasseur, MassageFinder, and ProMasseurs.',
};

export default function CompareHubPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Compare MasseurMatch to Other Directories</h1>
      <p className="text-lg text-muted-foreground mb-8">See how our verification process and premium UX compares to legacy directories.</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/compare/masseurmatch-vs-masseurfinder" className="p-6 border rounded-xl hover:bg-secondary transition">
          <h2 className="font-bold text-xl">MasseurMatch vs MasseurFinder</h2>
          <p className="text-sm mt-2 text-muted-foreground">Compare safety features and verified listings.</p>
        </Link>
        <Link href="/compare/masseurmatch-vs-rentmasseur" className="p-6 border rounded-xl hover:bg-secondary transition">
          <h2 className="font-bold text-xl">MasseurMatch vs RentMasseur</h2>
          <p className="text-sm mt-2 text-muted-foreground">Compare booking UX and trust signals.</p>
        </Link>
      </div>
    </main>
  );
}
