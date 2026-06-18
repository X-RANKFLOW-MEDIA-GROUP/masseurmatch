export type AvailabilityMode = 'in_city' | 'traveling' | 'arrival_window' | 'unavailable'

export type SmsIntent =
  | 'pricing'
  | 'availability'
  | 'session_length'
  | 'outcall'
  | 'couples'
  | 'asap'
  | 'booking_intent'
  | 'general'
  | 'unknown'

export interface SmsProfile {
  id: string
  profile_id: string
  ready_to_reply: boolean
  availability_mode: AvailabilityMode
  arrival_date: string | null
  departure_date: string | null
  pricing_60: string | null
  pricing_90: string | null
  pricing_couples: string | null
  outcall_available: boolean
  couples_available: boolean
  outcall_area: string | null
  alert_phone: string | null
  custom_instructions: string | null
  twilio_number: string | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: { display_name: string | null; city: string | null }
}

export interface SmsLog {
  id: string
  profile_id: string | null
  from_number: string
  to_number: string
  direction: 'inbound' | 'outbound'
  body: string
  twilio_sid: string | null
  intent: SmsIntent | null
  status: string
  is_manual: boolean
  booking_inquiry_id: string | null
  created_at: string
}

export interface SmsFollowUpAlert {
  id: string
  profile_id: string | null
  client_phone: string
  our_phone: string
  last_outbound_at: string
  last_inbound_at: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface Conversation {
  client_phone: string
  our_phone: string
  profile_id: string | null
  messages: SmsLog[]
  last_message_at: string
  unresolved_alert: boolean
  minutes_since_reply: number | null
}
