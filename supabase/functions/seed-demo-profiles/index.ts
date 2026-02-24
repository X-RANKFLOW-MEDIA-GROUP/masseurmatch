import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEMO_PROFILES = [
  {
    email: "demo.la@masseurmatch.com",
    full_name: "Marcus Rivera (Sample Profile)",
    display_name: "Marcus Rivera ★ Demo",
    bio: "Licensed massage therapist with over 8 years of experience specializing in deep tissue, sports recovery, and myofascial release. Based in Los Angeles, I work with athletes, professionals, and anyone seeking relief from chronic tension. My approach combines Swedish techniques with targeted pressure therapy to address muscle imbalances, improve circulation, and restore mobility. Certified in prenatal massage and cupping therapy. I believe in creating a calm, judgment-free space where every client feels comfortable and cared for.",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    specialties: ["Deep Tissue", "Sports Massage", "Myofascial Release", "Cupping Therapy", "Swedish Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "NASM Certified", "Prenatal Massage Certified"],
    languages: ["English", "Spanish"],
    incall_price: 150,
    outcall_price: 200,
  },
  {
    email: "demo.nyc@masseurmatch.com",
    full_name: "Daniel Kim (Sample Profile)",
    display_name: "Daniel Kim ★ Demo",
    bio: "Manhattan-based licensed bodyworker specializing in therapeutic and relaxation massage for busy professionals. With a background in kinesiology and 6 years of hands-on practice, I combine Eastern and Western techniques to deliver customized sessions. My specialties include shiatsu, trigger point therapy, and hot stone massage. I've worked with clients recovering from injuries, managing stress, and looking to improve their overall wellness. Every session is tailored to your body's unique needs. Available for incall at my Midtown studio or outcall across Manhattan and Brooklyn.",
    city: "New York",
    state: "NY",
    country: "USA",
    specialties: ["Shiatsu", "Trigger Point Therapy", "Hot Stone", "Relaxation Massage", "Thai Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "BS Kinesiology", "Thai Massage Level 2"],
    languages: ["English", "Korean"],
    incall_price: 180,
    outcall_price: 250,
  },
  {
    email: "demo.mia@masseurmatch.com",
    full_name: "Rafael Santos (Sample Profile)",
    display_name: "Rafael Santos ★ Demo",
    bio: "Professional massage therapist in Miami with a passion for holistic wellness and body recovery. I bring 5 years of experience working in luxury spas and private practice. Trained in Brazilian deep tissue techniques, aromatherapy, and reflexology. I specialize in helping clients manage stress, recover from physical activity, and achieve deep relaxation. My sessions incorporate essential oils and breathwork for a truly restorative experience. Whether you're a visitor enjoying Miami or a local in need of regular bodywork, I'm here to help you feel your best.",
    city: "Miami",
    state: "FL",
    country: "USA",
    specialties: ["Deep Tissue", "Aromatherapy", "Reflexology", "Relaxation Massage", "Lomi Lomi"],
    certifications: ["Licensed Massage Therapist (LMT)", "Aromatherapy Certification", "Reflexology Diploma"],
    languages: ["English", "Portuguese", "Spanish"],
    incall_price: 140,
    outcall_price: 190,
  },
  {
    email: "demo.sf@masseurmatch.com",
    full_name: "James Chen (Sample Profile)",
    display_name: "James Chen ★ Demo",
    bio: "San Francisco based massage therapist with 10+ years of experience in therapeutic bodywork. I hold advanced certifications in neuromuscular therapy and craniosacral work. My practice focuses on chronic pain management, postural correction, and stress relief for tech professionals dealing with desk-related tension. I integrate multiple modalities—deep tissue, myofascial release, and stretching techniques—into each session based on your specific needs. Conveniently located in the SOMA district with flexible scheduling including evenings and weekends.",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    specialties: ["Neuromuscular Therapy", "Craniosacral", "Deep Tissue", "Postural Correction", "Stretching"],
    certifications: ["Licensed Massage Therapist (LMT)", "Neuromuscular Therapy Certification", "Craniosacral Therapy Level 3"],
    languages: ["English", "Mandarin"],
    incall_price: 170,
    outcall_price: 220,
  },
  {
    email: "demo.chi@masseurmatch.com",
    full_name: "Andre Williams (Sample Profile)",
    display_name: "Andre Williams ★ Demo",
    bio: "Chicago-based licensed massage therapist dedicated to helping clients achieve peak physical performance and deep relaxation. With 7 years of professional experience, I've developed expertise in sports massage, lymphatic drainage, and injury rehabilitation. I work with everyone from marathon runners to office workers experiencing chronic back pain. My holistic approach considers your lifestyle, movement patterns, and goals to deliver sessions that produce lasting results. Available for incall at my Lincoln Park studio or outcall throughout the Chicago metro area.",
    city: "Chicago",
    state: "IL",
    country: "USA",
    specialties: ["Sports Massage", "Lymphatic Drainage", "Injury Rehabilitation", "Deep Tissue", "Swedish Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "Sports Massage Specialist", "Lymphatic Drainage Certified"],
    languages: ["English"],
    incall_price: 130,
    outcall_price: 180,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: "Admin only" }), { status: 403 });

    const results: string[] = [];

    for (const demo of DEMO_PROFILES) {
      // Check if demo user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u: any) => u.email === demo.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        results.push(`⏭️ ${demo.display_name} already exists`);
      } else {
        // Create auth user
        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
          email: demo.email,
          password: crypto.randomUUID(), // random password, these are demo accounts
          email_confirm: true,
          user_metadata: { full_name: demo.full_name },
        });

        if (userError) {
          results.push(`❌ ${demo.display_name}: ${userError.message}`);
          continue;
        }
        userId = newUser.user.id;
        results.push(`✅ ${demo.display_name} created`);
      }

      // Upsert profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: userId,
        full_name: demo.full_name,
        display_name: demo.display_name,
        bio: demo.bio,
        city: demo.city,
        state: demo.state,
        country: demo.country,
        specialties: demo.specialties,
        certifications: demo.certifications,
        languages: demo.languages,
        incall_price: demo.incall_price,
        outcall_price: demo.outcall_price,
        is_active: true,
        status: "active",
        is_verified_profile: true,
      }, { onConflict: "user_id" });

      if (profileError) {
        results.push(`⚠️ Profile error for ${demo.display_name}: ${profileError.message}`);
      }
    }

    // Log the action
    await supabase.from("audit_log").insert({
      admin_user_id: user.id,
      action: "seed_demo_profiles",
      target_type: "system",
      details: { count: DEMO_PROFILES.length },
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
