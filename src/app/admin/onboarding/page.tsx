import React from 'react';
import { MassageTherapistOnboardingForm } from '../../../mm/components/forms/MassageTherapistOnboardingForm';
import { mapFormToProfileApi } from '../../../mm/utils/mapFormToProfileApi';
import { DebugProfilesButton } from './DebugProfilesButton';

export default function OnboardingPage() {
  const handleSubmit = async (values: Record<string, any>) => {
    const apiData = mapFormToProfileApi(values);
    const res = await fetch('/api/pro/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    });
    if (res.ok) {
      alert('Perfil salvo!');
    } else {
      alert('Erro ao salvar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Massagista</h1>
      <MassageTherapistOnboardingForm onSubmit={handleSubmit} />
      <DebugProfilesButton />
    </div>
  );
}
