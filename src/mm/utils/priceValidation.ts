// Função utilitária para validar preços conforme regra de 33.33%
export function isValidRate(prices: { duration_minutes: number; price: number }[]): boolean {
  if (!prices.length) return true;
  const base = prices[0];
  if (!base || !base.price || !base.duration_minutes) return true;
  const basePerMinute = base.price / base.duration_minutes;
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    if (!p.price || !p.duration_minutes) continue;
    const perMinute = p.price / p.duration_minutes;
    if (perMinute > basePerMinute * 1.3333) return false;
  }
  return true;
}

// Permitir "Ask Me", "Text Me", "Call Me" para price_or_label
export function isValidOutcallLabel(label: string): boolean {
  return (
    label === 'Ask Me' ||
    label === 'Text Me' ||
    label === 'Call Me' ||
    /^\d+(\.\d{1,2})?$/.test(label)
  );
}
