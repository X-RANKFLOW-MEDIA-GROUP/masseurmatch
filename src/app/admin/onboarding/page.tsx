import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Cadastro de Massagista</h1>
        <p className="mb-5 text-sm text-gray-600">
          O fluxo principal de onboarding esta consolidado em <strong>/pro/onboard</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pro/onboard"
            prefetch={false}
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Abrir onboarding principal
          </Link>
          <Link
            href="/pro/profile"
            prefetch={false}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Abrir perfil Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
