import { expect, test } from '@playwright/test';

test.describe('GET /api/pro/profiles', () => {
  test('should return a list of profiles', async ({ request }) => {
    const res = await request.get('/api/pro/profiles');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.profiles)).toBe(true);
  });

  test('should filter by city', async ({ request }) => {
    const res = await request.get('/api/pro/profiles?city=São Paulo');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.ok).toBe(true);
    data.profiles.forEach((p: any) => expect(p.city).toBe('São Paulo'));
  });

  test('should filter by technique', async ({ request }) => {
    const res = await request.get('/api/pro/profiles?technique=Deep Tissue');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.ok).toBe(true);
    data.profiles.forEach((p: any) => expect((p.massage_techniques||[]).includes('Deep Tissue')).toBe(true));
  });

  test('should successfully filter profiles by technique without throwing a 500 error', async ({ request }) => {
    // Testando a correção P0 específica: solicitando uma técnica (filtro em memória case-insensitive)
    const testTechnique = 'Deep Tissue';
    const response = await request.get(`/api/pro/profiles?technique=${encodeURIComponent(testTechnique)}`);
    
    // 1. Garante que o endpoint não quebre (Teste de resiliência)
    expect(response.status()).toBe(200);

    const data = await response.json();
    const profiles = data.profiles || [];
    
    // 2. Valida o contrato do filtro em memória
    if (profiles.length > 0) {
      for (const profile of profiles) {
        expect(profile).toHaveProperty('massage_techniques');
        
        // Normaliza tudo para minúsculas para validar a correção case-insensitive
        const hasTechnique = (profile.massage_techniques || []).some(
          (t: string) => t.toLowerCase() === testTechnique.toLowerCase()
        );
        
        expect(hasTechnique).toBeTruthy();
      }
    }
  });
});