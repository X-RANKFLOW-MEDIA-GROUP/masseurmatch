export type DemandLevel = "low" | "normal" | "strong" | "peak"

export type ContactAction = "call" | "text" | "whatsapp" | "email" | "profile"

export type DemandIndexInput = {
  score?: number | null
  hour?: number | null
}

export type DemandTherapist = {
  baseScore?: number | null
  availableNow?: boolean | null
  isFeatured?: boolean | null
  isVerified?: boolean | null
  hasFastResponse?: boolean | null
  hasPhone?: boolean | null
  hasSms?: boolean | null
  hasWhatsapp?: boolean | null
  hasEmail?: boolean | null
  lastAvailabilityConfirmedAt?: string | Date | null
  profileCompletionScore?: number | null
}

export const DEMAND_THRESHOLDS = {
  lowMax: 39,
  normalMin: 40,
  normalMax: 60,
  strongMin: 61,
  strongMax: 79,
  peakMin: 80,
  peakMax: 100,
} as const

export const PEAK_HOUR_WINDOW = {
  startHour: 3,
  endHour: 9,
} as const

export const DEMAND_TRACKING_EVENTS = {
  profileViewPeak: "profile_view_peak",
  profileViewStrong: "profile_view_strong",
  contactClickPeak: "contact_click_peak",
  contactClickStrong: "contact_click_strong",
  availableNowClick: "available_now_click",
  peakVisibilityUpsellShown: "peak_visibility_upsell_shown",
  peakVisibilityUpsellClick: "peak_visibility_upsell_click",
} as const

export function normalizeDemandScore(score?: number | null): number {
  if (typeof score !== "number" || Number.isNaN(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getDemandLevel(score?: number | null): DemandLevel {
  const normalizedScore = normalizeDemandScore(score)

  if (normalizedScore >= DEMAND_THRESHOLDS.peakMin) return "peak"
  if (normalizedScore >= DEMAND_THRESHOLDS.strongMin) return "strong"
  if (normalizedScore >= DEMAND_THRESHOLDS.normalMin) return "normal"
  return "low"
}

export function isPeakDemand(score?: number | null): boolean {
  return getDemandLevel(score) === "peak"
}

export function isStrongOrPeakDemand(score?: number | null): boolean {
  const level = getDemandLevel(score)
  return level === "strong" || level === "peak"
}

export function isPeakHour(hour?: number | null): boolean {
  if (typeof hour !== "number" || Number.isNaN(hour)) return false
  return hour >= PEAK_HOUR_WINDOW.startHour && hour <= PEAK_HOUR_WINDOW.endHour
}

export function isAvailabilityFresh(value?: string | Date | null, maxMinutes = 180): boolean {
  if (!value) return false

  const confirmedAt = value instanceof Date ? value : new Date(value)
  const timestamp = confirmedAt.getTime()

  if (Number.isNaN(timestamp)) return false

  const ageInMinutes = (Date.now() - timestamp) / 60000
  return ageInMinutes >= 0 && ageInMinutes <= maxMinutes
}

export function hasConfirmedAvailability(therapist: DemandTherapist): boolean {
  return Boolean(
    therapist.availableNow || isAvailabilityFresh(therapist.lastAvailabilityConfirmedAt),
  )
}

export function calculateTherapistDemandScore(
  therapist: DemandTherapist,
  demandScore?: number | null,
): number {
  let score = therapist.baseScore ?? 0
  const level = getDemandLevel(demandScore)
  const hasAvailableNow = hasConfirmedAvailability(therapist)

  if (level === "normal") {
    if (hasAvailableNow) score += 10
    if (therapist.isVerified) score += 5
  }

  if (level === "strong") {
    if (hasAvailableNow) score += 25
    if (therapist.isFeatured) score += 15
    if (therapist.hasFastResponse) score += 10
    if (therapist.isVerified) score += 8
  }

  if (level === "peak") {
    if (hasAvailableNow) score += 50
    if (therapist.isFeatured) score += 30
    if (therapist.hasFastResponse) score += 20
    if (therapist.isVerified) score += 12
    if (therapist.hasPhone) score += 10
    if (therapist.hasSms) score += 8
    if (therapist.hasWhatsapp) score += 8
    if (therapist.profileCompletionScore) score += Math.min(10, therapist.profileCompletionScore / 10)
  }

  return Math.round(score)
}

export function sortTherapistsByDemand<T extends DemandTherapist>(
  therapists: T[],
  demandScore?: number | null,
): T[] {
  return [...therapists].sort((a, b) => {
    const bScore = calculateTherapistDemandScore(b, demandScore)
    const aScore = calculateTherapistDemandScore(a, demandScore)
    return bScore - aScore
  })
}

export function getDemandHeroCopy(city: string, demandScore?: number | null): string {
  const level = getDemandLevel(demandScore)

  if (level === "peak") {
    return `Massage therapists available now in ${city}. Call or text directly.`
  }

  if (level === "strong") {
    return `Find available massage therapists in ${city}.`
  }

  if (level === "normal") {
    return `Find massage therapists in ${city}.`
  }

  return `Browse massage therapists in ${city}.`
}

export function getDemandSubcopy(city: string, demandScore?: number | null): string {
  const level = getDemandLevel(demandScore)

  if (level === "peak") {
    return `Demand is high right now. Prioritize providers marked available now and contact them directly.`
  }

  if (level === "strong") {
    return `Demand is active in ${city}. Check available providers and compare direct contact options.`
  }

  if (level === "normal") {
    return `Compare local providers, profile details, service areas, and direct contact options.`
  }

  return `Explore local profiles and save your preferred providers for later contact.`
}

export function getAvailableNowBadgeCopy(demandScore?: number | null): string | null {
  const level = getDemandLevel(demandScore)

  if (level === "peak") return "Available now in your area"
  if (level === "strong") return "Available now"
  return null
}

export function getContactActionPriority(
  therapist: DemandTherapist,
  demandScore?: number | null,
): ContactAction[] {
  const level = getDemandLevel(demandScore)
  const actions: ContactAction[] = []

  if (level === "peak") {
    if (therapist.hasPhone) actions.push("call")
    if (therapist.hasSms) actions.push("text")
    if (therapist.hasWhatsapp) actions.push("whatsapp")
    if (therapist.hasEmail) actions.push("email")
    actions.push("profile")
    return actions
  }

  if (level === "strong") {
    if (therapist.hasSms) actions.push("text")
    if (therapist.hasPhone) actions.push("call")
    if (therapist.hasWhatsapp) actions.push("whatsapp")
    if (therapist.hasEmail) actions.push("email")
    actions.push("profile")
    return actions
  }

  if (therapist.hasPhone) actions.push("call")
  if (therapist.hasSms) actions.push("text")
  if (therapist.hasWhatsapp) actions.push("whatsapp")
  if (therapist.hasEmail) actions.push("email")
  actions.push("profile")

  return actions
}

export function getDemandTrackingEvent(
  action: "profile_view" | "contact_click" | "available_now_click" | "upsell_shown" | "upsell_click",
  demandScore?: number | null,
): string | null {
  const level = getDemandLevel(demandScore)

  if (action === "available_now_click") return DEMAND_TRACKING_EVENTS.availableNowClick
  if (action === "upsell_shown" && level === "peak") return DEMAND_TRACKING_EVENTS.peakVisibilityUpsellShown
  if (action === "upsell_click" && level === "peak") return DEMAND_TRACKING_EVENTS.peakVisibilityUpsellClick
  if (action === "profile_view" && level === "peak") return DEMAND_TRACKING_EVENTS.profileViewPeak
  if (action === "profile_view" && level === "strong") return DEMAND_TRACKING_EVENTS.profileViewStrong
  if (action === "contact_click" && level === "peak") return DEMAND_TRACKING_EVENTS.contactClickPeak
  if (action === "contact_click" && level === "strong") return DEMAND_TRACKING_EVENTS.contactClickStrong

  return null
}

export function shouldShowPeakVisibilityUpsell(
  therapist: DemandTherapist,
  demandScore?: number | null,
): boolean {
  return isPeakDemand(demandScore) && !therapist.isFeatured && hasConfirmedAvailability(therapist)
}

export function getDemandSeoMetadata(city: string, demandScore?: number | null) {
  const level = getDemandLevel(demandScore)

  if (level === "peak") {
    return {
      title: `Massage Therapists Available Now in ${city}`,
      description: `Find massage therapists available now in ${city}. Compare local profiles and contact providers directly by call, text, WhatsApp, or email.`,
    }
  }

  if (level === "strong") {
    return {
      title: `Available Massage Therapists in ${city}`,
      description: `Browse available massage therapists in ${city}. Compare profiles, service areas, and direct contact options.`,
    }
  }

  return {
    title: `Massage Therapists in ${city}`,
    description: `Browse massage therapist profiles in ${city}. Compare services, locations, and direct contact options.`,
  }
}
