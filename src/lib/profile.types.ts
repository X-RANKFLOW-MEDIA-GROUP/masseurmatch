import type { Tables, TablesUpdate } from '@/integrations/supabase/types'

export type Profile = Tables<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

/**
 * Subset of ProfileUpdate scoped to onboarding fields added in the
 * May 2026 schema migration (17 new columns on `profiles`).
 */
export type OnboardingFields = Pick<
  ProfileUpdate,
  | 'zip_code'
  | 'street_reference'
  | 'map_enabled'
  | 'location_marker_type'
  | 'massage_setup'
  | 'incall_amenities'
  | 'mobile_extras'
  | 'products_used'
  | 'products_sold'
  | 'payment_methods'
  | 'regular_discounts'
  | 'day_of_week_discount'
  | 'weekly_special'
  | 'booking_platform'
  | 'booking_url'
  | 'education_entries'
  | 'business_trips'
>
