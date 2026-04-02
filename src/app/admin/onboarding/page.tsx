import React from 'react';
import Link from 'next/link';
import { DebugProfilesButton } from './DebugProfilesButton';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Cadastro de Massagista</h1>
        <p className="text-sm text-gray-600 mb-5">
          O fluxo principal de onboarding está consolidado em <strong>/pro/onboard</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pro/onboard"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Abrir onboarding principal
          </Link>
          <Link
            href="/pro/profile"
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Abrir perfil Pro
          </Link>
        </div>
        <DebugProfilesButton />
      </div>
    </div>
  );
}
