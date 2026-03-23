// Adapta os dados do formulário para o formato esperado pelo endpoint /api/pro/profile
export function mapFormToProfileApi(form: Record<string, any>) {
  return {
    displayName: form.display_name,
    bio: form.bio_full || form.bio_short,
    city: form.city,
    state: form.state,
    phone: form.phone_number,
    specialties: form.specialties || [],
    incallPrice: form.rates_incall?.[0]?.price || null,
    outcallPrice: form.rates_outcall?.[0]?.price_or_label || null,
    heightInches: form.height_inches || null,
    weightLb: form.weight_lb || null,
    bodyType: form.body_type || null,
    // Adicione outros campos conforme o backend aceitar
  };
}
