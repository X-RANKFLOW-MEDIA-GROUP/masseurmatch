import type { IntelligenceReport, RiskLevel } from './types'

const SPAM_KEYWORDS = ['scam', 'fraud', 'fake', 'complaint', 'reported', 'spam', 'block this', 'warning', 'dangerous', 'do not answer', 'robocall', 'harass']

async function twilioLookup(phone: string): Promise<{ carrier?: string; lineType?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return {}

  try {
    const encoded = encodeURIComponent(phone)
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encoded}?Fields=line_type_intelligence`
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return {}
    const data = (await res.json()) as {
      line_type_intelligence?: { type?: string; carrier_name?: string }
    }
    return {
      carrier: data.line_type_intelligence?.carrier_name ?? undefined,
      lineType: data.line_type_intelligence?.type ?? undefined,
    }
  } catch {
    return {}
  }
}

async function serpSearch(query: string): Promise<string[]> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return []

  try {
    const url = new URL('https://serpapi.com/search')
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('engine', 'google')
    url.searchParams.set('q', query)
    url.searchParams.set('num', '5')
    url.searchParams.set('gl', 'us')

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return []

    const data = (await res.json()) as {
      organic_results?: Array<{ title?: string; snippet?: string }>
    }

    return (data.organic_results ?? [])
      .map(r => [r.title, r.snippet].filter(Boolean).join(' — '))
      .filter(Boolean)
      .slice(0, 5)
  } catch {
    return []
  }
}

function assessRisk(
  spamHits: string[],
  lineType: string | undefined,
  carrier: string | undefined
): RiskLevel {
  if (spamHits.length >= 3) return 'high'
  if (spamHits.length >= 1) return 'medium'
  if (!carrier && !lineType) return 'unknown'
  // VOIP lines get slightly elevated caution
  if (lineType === 'voip') return 'medium'
  return 'low'
}

export async function runIntelligence(
  phone: string,
  name?: string | null
): Promise<IntelligenceReport> {
  const [twilioData, phoneSearchResults, nameSearchResults] = await Promise.allSettled([
    twilioLookup(phone),
    // Search for the phone number on complaint/spam sites
    serpSearch(`"${phone}" site:800notes.com OR site:callercenter.com OR site:whycall.me OR scam OR fraud OR spam`),
    // Search for name + phone combo if we have it
    name
      ? serpSearch(`"${name}" "${phone}" scam OR fraud OR complaint OR fake`)
      : Promise.resolve([] as string[]),
  ])

  const twilio = twilioData.status === 'fulfilled' ? twilioData.value : {}
  const phoneResults = phoneSearchResults.status === 'fulfilled' ? phoneSearchResults.value : []
  const nameResults = nameSearchResults.status === 'fulfilled' ? nameSearchResults.value : []

  const allFindings = [...phoneResults, ...nameResults]
  const spamReports = allFindings.filter(f =>
    SPAM_KEYWORDS.some(kw => f.toLowerCase().includes(kw))
  )

  return {
    phone,
    carrier: twilio.carrier,
    lineType: twilio.lineType,
    spamReports,
    webFindings: allFindings,
    riskLevel: assessRisk(spamReports, twilio.lineType, twilio.carrier),
    checkedAt: new Date().toISOString(),
    sources: ['twilio_lookup', 'web_search'],
  }
}

export function intelligenceStatusFromReport(report: IntelligenceReport): 'clean' | 'flagged' | 'inconclusive' {
  if (report.riskLevel === 'high') return 'flagged'
  if (report.riskLevel === 'low') return 'clean'
  return 'inconclusive'
}
