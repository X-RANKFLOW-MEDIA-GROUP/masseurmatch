import { json } from "@/app/api/_lib/http";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";



type ProfileWithTechniques = {
  
  massage_techniques?: unknown;
  
};



function emptyProfilesResponse(): Response {
  
  return json({ ok: true, profiles: [] });
  
}



export async function GET(request: Request) {
  
  const url = new URL(request.url);
  
  const city = url.searchParams.get("city");
  
  const technique = url.searchParams.get("technique");
  
  const tier = url.searchParams.get("tier");
  
  const available = url.searchParams.get("available");
  
  const normalizedTechnique = technique?.trim().toLowerCase();
  

  
  try {
    
    const adminClient = createSupabaseAdminClient();
    
    let query = adminClient.from("profiles").select("*", { head: false });
    
    if (city) query = query.eq("city", city);
    
    if (tier) query = query.eq("subscription_tier", tier);
    
    if (available) query = query.eq("available_now", available === "true");
    

    
    const { data, error } = await query.limit(200);
    
    if (error) {
      
      console.error("Profiles listing query failed:", error);
      
      return emptyProfilesResponse();
      
    }
    

    
    const profiles = (data || []).filter((profile: ProfileWithTechniques) => {
      
      if (!normalizedTechnique) {
        
        return true;
        
      }
      

      
      const techniques = Array.isArray(profile.massage_techniques) ? profile.massage_techniques : [];
      

      
      return techniques.some((value) =>
        
        typeof value === "string" && value.trim().toLowerCase() === normalizedTechnique,
                             
      );
      
    });
    

    
    return json({ ok: true, profiles });
    
  } catch (error) {
    
    console.error("Profiles listing unavailable:", error);
    
    return emptyProfilesResponse();
    
  }
  
}











































