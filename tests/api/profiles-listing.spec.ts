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
});
