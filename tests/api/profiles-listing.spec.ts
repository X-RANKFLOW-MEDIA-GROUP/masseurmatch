import { expect, test } from '@playwright/test';

// /api/pro/profiles is a provider-scoped endpoint: it returns only the
// authenticated provider's own profile and rejects anonymous requests
// (see src/app/api/pro/profiles/route.ts). These tests pin that contract —
// the endpoint must never leak profile data without a session.
test.describe('GET /api/pro/profiles', () => {
  test('rejects anonymous requests with 401', async ({ request }) => {
    const res = await request.get('/api/pro/profiles');
    expect(res.status()).toBe(401);
    const data = await res.json();
    expect(data.error).toBeTruthy();
    expect(data.profiles).toBeUndefined();
  });

  test('rejects anonymous requests with query params (city)', async ({ request }) => {
    const res = await request.get('/api/pro/profiles?city=São Paulo');
    expect(res.status()).toBe(401);
    const data = await res.json();
    expect(data.profiles).toBeUndefined();
  });

  test('rejects anonymous requests with query params (technique)', async ({ request }) => {
    const res = await request.get('/api/pro/profiles?technique=Deep Tissue');
    expect(res.status()).toBe(401);
    const data = await res.json();
    expect(data.profiles).toBeUndefined();
  });

  test('does not throw a 500 for filtered anonymous requests', async ({ request }) => {
    const response = await request.get(
      `/api/pro/profiles?technique=${encodeURIComponent('Deep Tissue')}`,
    );
    expect(response.status()).toBeLessThan(500);
    expect(response.status()).toBe(401);
  });
});
