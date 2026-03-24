import React from 'react';
import { fetchProfiles } from '../../../mm/utils/fetchProfiles';

export function DebugProfilesButton() {
  const handleClick = async () => {
    try {
      const profiles = await fetchProfiles({ city: 'São Paulo', technique: 'Deep Tissue' });
      alert(`Perfis encontrados: ${profiles.length}`);
      console.log(profiles);
    } catch (e) {
      alert('Erro ao buscar perfis');
    }
  };
  return (
    <button className="btn btn-secondary mt-4" onClick={handleClick} type="button">
      Debug: Buscar perfis (São Paulo, Deep Tissue)
    </button>
  );
}
