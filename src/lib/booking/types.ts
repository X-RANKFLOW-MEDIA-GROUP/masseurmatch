export type InquiryStatus =
  | 'new'
  | 'checking'
  | 'pending_approval'
  | 'approved'
  | 'denied'
  | 'completed'
  | 'cancelled'

export type IntelligenceStatus = 'pending' | 'running' | 'clean' | 'flagged' | 'inconclusive'

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  ts?: string
}

export interface IntelligenceReport {
  phone?: string
  carrier?: string
  lineType?: string
  spamReports: string[]
  webFindings: string[]
  riskLevel: RiskLevel
  checkedAt: string
  sources: string[]
}

export interface BookingInquiry {
  id: string
  client_name: string | null
  client_phone: string | null
  client_email: string | null
  client_hotel: string | null
  service_type: string | null
  preferred_date: string | null
  preferred_time: string | null
  duration_minutes: number
  message: string | null
  source: string
  therapist_id: string | null
  status: InquiryStatus
  intelligence_status: IntelligenceStatus
  intelligence_report: IntelligenceReport
  ai_conversation: ConversationMessage[]
  confirmed_date: string | null
  confirmed_time: string | null
  appointment_id: string | null
  sheets_row_id: string | null
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface NewInquiryInput {
  client_name?: string
  client_phone?: string
  client_email?: string
  client_hotel?: string
  service_type?: string
  preferred_date?: string
  preferred_time?: string
  duration_minutes?: number
  message?: string
  source?: string
  therapist_id?: string
}

export interface AvailableSlot {
  date: string
  time: string
  label: string
}
