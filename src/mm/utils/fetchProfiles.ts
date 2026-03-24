// Exemplo de fetch para buscar perfis de massagistas
export async function fetchProfiles({ city, technique, tier, available }: {
  city?: string;
  technique?: string;
  tier?: string;
  available?: boolean;
} = {}) {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (technique) params.append('technique', technique);
  if (tier) params.append('tier', tier);
  if (available !== undefined) params.append('available', String(available));
  const res = await fetch(`/api/pro/profiles?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar perfis');
  const data = await res.json();
  return data.profiles;
}
