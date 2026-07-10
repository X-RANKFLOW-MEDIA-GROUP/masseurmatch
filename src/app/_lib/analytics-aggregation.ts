import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as sharedBrowserClient } from "@/integrations/supabase/client";

// Creating the client at module scope with raw env crashed every client
// bundle that imported this file ("supabaseKey is required"): the service
// role key is never available in the browser. Resolve lazily instead —
// server code gets the service-role client, browser code degrades to the
// shared anon client (writes remain subject to Row Level Security).
let cachedClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cachedClient =
    url && serviceKey
      ? createClient(url, serviceKey)
      : (sharedBrowserClient as unknown as SupabaseClient);
  return cachedClient;
}

export interface DemandSpikeData {
  day: string;
  searches: number;
  views: number;
}

export interface SearchTrendData {
  keyword: string;
  searches: number;
  trend: number;
}

export interface ZipCodeData {
  zip_code: string;
  city: string;
  demand: number;
  rank: number;
}

export interface PeakTimeData {
  timeSlot: string;
  views: number;
  percentage: number;
}

export interface CityDemandData {
  city: string;
  state: string;
  demandScore: number;
  competitionLevel: number;
  opportunity: string;
}

export interface HotelOpportunityData {
  area: string;
  hotels: number;
  searches: number;
  demand: "Low" | "Medium" | "High" | "Very High";
  suggested: boolean;
}

// Get search trends for the last 7 days grouped by day
export async function getDemandSpikes(): Promise<DemandSpikeData[]> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [searchesResult, viewsResult] = await Promise.all([
      getSupabase()
        .from("search_analytics")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString()),
      getSupabase()
        .from("profile_view_analytics")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString()),
    ]);

    const dayMap = new Map<string, { searches: number; views: number }>();

    // Process searches
    if (searchesResult.data) {
      searchesResult.data.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!dayMap.has(date)) {
          dayMap.set(date, { searches: 0, views: 0 });
        }
        dayMap.get(date)!.searches += 1;
      });
    }

    // Process profile views
    if (viewsResult.data) {
      viewsResult.data.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!dayMap.has(date)) {
          dayMap.set(date, { searches: 0, views: 0 });
        }
        dayMap.get(date)!.views += 1;
      });
    }

    return Array.from(dayMap.entries()).map(([day, data]) => ({
      day,
      searches: data.searches,
      views: data.views,
    }));
  } catch (err) {
    console.error("Error getting demand spikes:", err);
    return [];
  }
}

// Get top search queries with volume and trend
export async function getSearchTrends(
  limit: number = 10
): Promise<SearchTrendData[]> {
  try {
    const result = await getSupabase().from("search_analytics").select("query");

    if (!result.data) return [];

    // Count queries and calculate trends
    const queryMap = new Map<string, number>();
    result.data.forEach((item) => {
      const query = item.query.toLowerCase();
      queryMap.set(query, (queryMap.get(query) || 0) + 1);
    });

    return Array.from(queryMap.entries())
      .map(([keyword, searches]) => ({
        keyword,
        searches,
        trend: Math.round(Math.random() * 40 - 10), // Placeholder for growth rate calculation
      }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, limit);
  } catch (err) {
    console.error("Error getting search trends:", err);
    return [];
  }
}

// Get popular ZIP codes by demand
export async function getPopularZipCodes(
  limit: number = 10
): Promise<ZipCodeData[]> {
  try {
    const result = await getSupabase()
      .from("search_analytics")
      .select("zip_code, city");

    if (!result.data) return [];

    const zipMap = new Map<
      string,
      { zip_code: string; city: string; count: number }
    >();

    result.data.forEach((item) => {
      const key = item.zip_code || "unknown";
      if (!zipMap.has(key)) {
        zipMap.set(key, {
          zip_code: key,
          city: item.city || "Unknown",
          count: 0,
        });
      }
      zipMap.get(key)!.count += 1;
    });

    return Array.from(zipMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, idx) => ({
        zip_code: item.zip_code,
        city: item.city,
        demand: item.count,
        rank: idx + 1,
      }));
  } catch (err) {
    console.error("Error getting popular ZIP codes:", err);
    return [];
  }
}

// Get peak times by hour
export async function getPeakTimes(): Promise<PeakTimeData[]> {
  try {
    const result = await getSupabase()
      .from("profile_view_analytics")
      .select("created_at");

    if (!result.data) return [];

    const timeMap = new Map<string, number>();
    const timeSlots = [
      { slot: "12am-4am", hours: [0, 1, 2, 3] },
      { slot: "4am-8am", hours: [4, 5, 6, 7] },
      { slot: "8am-12pm", hours: [8, 9, 10, 11] },
      { slot: "12pm-4pm", hours: [12, 13, 14, 15] },
      { slot: "4pm-8pm", hours: [16, 17, 18, 19] },
      { slot: "8pm-12am", hours: [20, 21, 22, 23] },
    ];

    timeSlots.forEach(({ slot }) => timeMap.set(slot, 0));

    result.data.forEach((item) => {
      const hour = new Date(item.created_at).getHours();
      const slot = timeSlots.find((s) => s.hours.includes(hour));
      if (slot) {
        timeMap.set(slot.slot, (timeMap.get(slot.slot) || 0) + 1);
      }
    });

    const total = Array.from(timeMap.values()).reduce((a, b) => a + b, 0);

    return timeSlots.map(({ slot }) => ({
      timeSlot: slot,
      views: timeMap.get(slot) || 0,
      percentage: total > 0 ? Math.round(((timeMap.get(slot) || 0) / total) * 100) : 0,
    }));
  } catch (err) {
    console.error("Error getting peak times:", err);
    return [];
  }
}

// Get city demand comparison
export async function getCityDemandScores(): Promise<CityDemandData[]> {
  try {
    const [searchResult, viewResult, inquiryResult] = await Promise.all([
      getSupabase().from("search_analytics").select("city"),
      getSupabase().from("profile_view_analytics").select("viewer_city"),
      getSupabase().from("inquiry_analytics").select("user_city"),
    ]);

    const cityMap = new Map<
      string,
      { searches: number; views: number; inquiries: number }
    >();

    // Count searches
    if (searchResult.data) {
      searchResult.data.forEach((item) => {
        const city = item.city || "Unknown";
        if (!cityMap.has(city)) {
          cityMap.set(city, { searches: 0, views: 0, inquiries: 0 });
        }
        cityMap.get(city)!.searches += 1;
      });
    }

    // Count views
    if (viewResult.data) {
      viewResult.data.forEach((item) => {
        const city = item.viewer_city || "Unknown";
        if (!cityMap.has(city)) {
          cityMap.set(city, { searches: 0, views: 0, inquiries: 0 });
        }
        cityMap.get(city)!.views += 1;
      });
    }

    // Count inquiries
    if (inquiryResult.data) {
      inquiryResult.data.forEach((item) => {
        const city = item.user_city || "Unknown";
        if (!cityMap.has(city)) {
          cityMap.set(city, { searches: 0, views: 0, inquiries: 0 });
        }
        cityMap.get(city)!.inquiries += 1;
      });
    }

    return Array.from(cityMap.entries())
      .map(([city, data]) => {
        const demandScore = Math.round(
          (data.searches * 0.3 + data.views * 0.5 + data.inquiries * 0.2) / 100
        );
        const competitionLevel = Math.round(Math.random() * 10);
        const opportunity =
          demandScore > 50
            ? "High opportunity"
            : demandScore > 30
              ? "Growing market"
              : "Low demand";

        return {
          city,
          state: "TX", // Placeholder
          demandScore,
          competitionLevel,
          opportunity,
        };
      })
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 5);
  } catch (err) {
    console.error("Error getting city demand scores:", err);
    return [];
  }
}

// Get hotel search opportunities
export async function getHotelOpportunities(): Promise<HotelOpportunityData[]> {
  try {
    const result = await getSupabase()
      .from("search_analytics")
      .select("zip_code, city, filters");

    if (!result.data) return [];

    const hotelZips = new Map<
      string,
      { area: string; searches: number; city: string }
    >();

    result.data.forEach((item) => {
      const filters = item.filters as Record<string, unknown> | null;
      if (filters && filters.session === "hotel") {
        const key = item.zip_code || "unknown";
        if (!hotelZips.has(key)) {
          hotelZips.set(key, {
            area: `${item.city || "Area"} (${key})`,
            searches: 0,
            city: item.city || "Unknown",
          });
        }
        hotelZips.get(key)!.searches += 1;
      }
    });

    return Array.from(hotelZips.values())
      .map((item, idx) => {
        const demand: "Low" | "Medium" | "High" | "Very High" =
          item.searches > 600
            ? "Very High"
            : item.searches > 400
              ? "High"
              : item.searches > 250
                ? "Medium"
                : "Low";
        const suggested = ["Very High", "High"].includes(demand);

        return {
          area: item.area,
          hotels: Math.round(15 + Math.random() * 40),
          searches: item.searches,
          demand,
          suggested,
        };
      })
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 8);
  } catch (err) {
    console.error("Error getting hotel opportunities:", err);
    return [];
  }
}
