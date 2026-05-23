'use server'

import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import type { OnboardingFields } from '@/lib/profile.types'

export async function saveOnboardingStep(
  profileId: string,
  data: OnboardingFields
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', profileId)

  if (profileError) throw profileError

  const publicFields = {
    zip_code:             data.zip_code,
    map_enabled:          data.map_enabled,
    location_marker_type: data.location_marker_type,
    massage_setup:        data.massage_setup,
    payment_methods:      data.payment_methods,
    booking_platform:     data.booking_platform,
    booking_url:          data.booking_url,
    products_used:        data.products_used,
    products_sold:        data.products_sold,
  }

  const { error: publicError } = await supabase
    .from('public_therapists')
    .update(publicFields)
    .eq('id', profileId)

  if (publicError) throw publicError
}
