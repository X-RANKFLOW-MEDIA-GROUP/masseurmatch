import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ═══════════════════════════════════════════
   SEED PROFILES — 24 realistic therapist listings
   These populate the directory for launch.
   Rules:
   - is_seed_profile = true (internal only, never shown to public)
   - No "Demo" or "Sample" labels visible anywhere
   - No fake reviews or unearned verification badges
   - is_verified_identity = false, is_verified_photos = false
   - is_verified_profile = false (seed profiles bypass via is_seed_profile)
   - Neutral, plausible bios — no exaggerated claims
   - Each gets a seed_slug for claim-by-URL
   ═══════════════════════════════════════════ */

interface SeedProfile {
  email: string;
  full_name: string;
  display_name: string;
  seed_slug: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  specialties: string[];
  certifications: string[];
  languages: string[];
  incall_price: number;
  outcall_price: number;
  business_hours: Record<string, unknown>;
  pricing_sessions: { name: string; duration: number; incall: number; outcall: number }[];
}

const SEED_PROFILES: SeedProfile[] = [
  // ── Los Angeles (3) ──
  {
    email: "seed-la-1@masseurmatch.internal",
    full_name: "Marcus Rivera",
    display_name: "Marcus Rivera",
    seed_slug: "marcus-rivera-los-angeles",
    bio: "Licensed massage therapist based in West Hollywood with over 8 years of experience. I focus on deep tissue work, sports recovery, and myofascial release for athletes and professionals dealing with chronic tension. My sessions combine targeted pressure with Swedish flow techniques to improve circulation and restore mobility. I maintain a calm, professional environment where every client feels comfortable.",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    specialties: ["Deep Tissue", "Sports Massage", "Myofascial Release", "Swedish Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "NASM Certified"],
    languages: ["English", "Spanish"],
    incall_price: 150,
    outcall_price: 200,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "20:00" }, Tuesday: { active: true, start: "10:00", end: "20:00" }, Wednesday: { active: true, start: "10:00", end: "20:00" }, Thursday: { active: true, start: "10:00", end: "20:00" }, Friday: { active: true, start: "10:00", end: "20:00" }, Saturday: { active: true, start: "11:00", end: "18:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: { Monday: { active: true, start: "12:00", end: "21:00" }, Tuesday: { active: true, start: "12:00", end: "21:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "12:00", end: "21:00" }, Friday: { active: true, start: "12:00", end: "21:00" }, Saturday: { active: true, start: "12:00", end: "19:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } } },
    pricing_sessions: [
      { name: "Swedish Relaxation", duration: 60, incall: 150, outcall: 200 },
      { name: "Deep Tissue", duration: 90, incall: 210, outcall: 270 },
      { name: "Sports Recovery", duration: 120, incall: 280, outcall: 350 },
    ],
  },
  {
    email: "seed-la-2@masseurmatch.internal",
    full_name: "Jordan Blake",
    display_name: "Jordan Blake",
    seed_slug: "jordan-blake-los-angeles",
    bio: "I bring 5 years of professional bodywork experience to every session. Trained in both Eastern and Western modalities, I specialize in therapeutic massage for stress relief, flexibility improvement, and general wellness. Based in Silver Lake, I offer a straightforward approach — no gimmicks, just effective bodywork tailored to what your body needs that day. Available for incall and outcall throughout LA.",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    specialties: ["Therapeutic Massage", "Stretching", "Relaxation Massage", "Hot Stone"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English"],
    incall_price: 120,
    outcall_price: 170,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: true, start: "10:00", end: "16:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Therapeutic Massage", duration: 60, incall: 120, outcall: 170 },
      { name: "Extended Session", duration: 90, incall: 170, outcall: 230 },
    ],
  },
  {
    email: "seed-la-3@masseurmatch.internal",
    full_name: "Tomás Ávila",
    display_name: "Tomás Ávila",
    seed_slug: "tomas-avila-los-angeles",
    bio: "Bodyworker with 6 years of experience in therapeutic and relaxation massage. I trained in Brazil before relocating to Los Angeles, and my practice blends deep tissue, lymphatic drainage, and aromatherapy. I work from my private studio in Mid-Wilshire and also travel to clients across the Westside. Sessions are customized based on intake and ongoing feedback. I prioritize clear communication and professional boundaries.",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    specialties: ["Deep Tissue", "Lymphatic Drainage", "Aromatherapy", "Relaxation Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "Aromatherapy Certified"],
    languages: ["English", "Portuguese", "Spanish"],
    incall_price: 140,
    outcall_price: 190,
    business_hours: { incall: { Monday: { active: true, start: "11:00", end: "21:00" }, Tuesday: { active: true, start: "11:00", end: "21:00" }, Wednesday: { active: true, start: "11:00", end: "21:00" }, Thursday: { active: false, start: "09:00", end: "18:00" }, Friday: { active: true, start: "11:00", end: "21:00" }, Saturday: { active: true, start: "10:00", end: "19:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Relaxation", duration: 60, incall: 140, outcall: 190 },
      { name: "Deep Tissue", duration: 90, incall: 200, outcall: 260 },
      { name: "Lymphatic + Aromatherapy", duration: 120, incall: 260, outcall: 330 },
    ],
  },

  // ── New York (3) ──
  {
    email: "seed-nyc-1@masseurmatch.internal",
    full_name: "Daniel Kim",
    display_name: "Daniel Kim",
    seed_slug: "daniel-kim-new-york",
    bio: "Manhattan-based licensed bodyworker with a background in kinesiology and 6 years of practice. I combine Eastern and Western techniques for customized sessions that address your specific concerns. My specialties include shiatsu, trigger point therapy, and hot stone massage. I work with clients managing stress, recovering from injuries, or looking to improve overall wellness. Available at my Midtown studio or outcall across Manhattan and Brooklyn.",
    city: "New York",
    state: "NY",
    country: "USA",
    specialties: ["Shiatsu", "Trigger Point Therapy", "Hot Stone", "Thai Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "BS Kinesiology"],
    languages: ["English", "Korean"],
    incall_price: 180,
    outcall_price: 250,
    business_hours: { incall: { Monday: { active: true, start: "08:00", end: "20:00" }, Tuesday: { active: true, start: "08:00", end: "20:00" }, Wednesday: { active: true, start: "08:00", end: "20:00" }, Thursday: { active: true, start: "08:00", end: "20:00" }, Friday: { active: true, start: "08:00", end: "20:00" }, Saturday: { active: true, start: "09:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Shiatsu", duration: 60, incall: 180, outcall: 250 },
      { name: "Deep Tissue", duration: 90, incall: 250, outcall: 340 },
      { name: "Hot Stone Premium", duration: 120, incall: 320, outcall: 400 },
    ],
  },
  {
    email: "seed-nyc-2@masseurmatch.internal",
    full_name: "Elijah Moore",
    display_name: "Elijah Moore",
    seed_slug: "elijah-moore-new-york",
    bio: "Professional massage therapist in Brooklyn with 4 years of experience. I specialize in Swedish massage and deep tissue work for clients who spend long hours at a desk. My approach is grounded in anatomy and biomechanics — I assess posture and movement patterns to target the root cause of discomfort rather than just the symptoms. Sessions are available at my Williamsburg studio. Evenings and weekends available by appointment.",
    city: "New York",
    state: "NY",
    country: "USA",
    specialties: ["Swedish Massage", "Deep Tissue", "Postural Correction", "Chair Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English"],
    incall_price: 160,
    outcall_price: 220,
    business_hours: { incall: { Monday: { active: true, start: "12:00", end: "21:00" }, Tuesday: { active: true, start: "12:00", end: "21:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "12:00", end: "21:00" }, Friday: { active: true, start: "12:00", end: "21:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "10:00", end: "16:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 160, outcall: 220 },
      { name: "Deep Tissue", duration: 90, incall: 230, outcall: 300 },
    ],
  },
  {
    email: "seed-nyc-3@masseurmatch.internal",
    full_name: "Carlos Méndez",
    display_name: "Carlos Méndez",
    seed_slug: "carlos-mendez-new-york",
    bio: "Originally from Mexico City, I've been practicing massage therapy in New York for 7 years. My specialty is combining traditional Mexican bodywork with modern therapeutic techniques. I focus on back pain, shoulder tension, and stress-related issues that are common among city dwellers. My Queens studio offers a quiet escape from the urban pace. I believe effective bodywork starts with careful listening.",
    city: "New York",
    state: "NY",
    country: "USA",
    specialties: ["Therapeutic Massage", "Back Pain Relief", "Relaxation Massage", "Cupping Therapy"],
    certifications: ["Licensed Massage Therapist (LMT)", "Cupping Therapy Certified"],
    languages: ["English", "Spanish"],
    incall_price: 140,
    outcall_price: 200,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "19:00" }, Tuesday: { active: true, start: "10:00", end: "19:00" }, Wednesday: { active: true, start: "10:00", end: "19:00" }, Thursday: { active: true, start: "10:00", end: "19:00" }, Friday: { active: true, start: "10:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Therapeutic", duration: 60, incall: 140, outcall: 200 },
      { name: "Deep Tissue + Cupping", duration: 90, incall: 200, outcall: 270 },
    ],
  },

  // ── Miami (3) ──
  {
    email: "seed-mia-1@masseurmatch.internal",
    full_name: "Rafael Santos",
    display_name: "Rafael Santos",
    seed_slug: "rafael-santos-miami",
    bio: "Professional massage therapist in Miami with a passion for holistic wellness and body recovery. I bring 5 years of experience working in private practice. Trained in Brazilian deep tissue techniques, aromatherapy, and reflexology. I specialize in helping clients manage stress and achieve deep relaxation. My sessions incorporate essential oils and breathwork for a truly restorative experience. Whether you're a visitor or a local, I'm here to help you feel your best.",
    city: "Miami",
    state: "FL",
    country: "USA",
    specialties: ["Deep Tissue", "Aromatherapy", "Reflexology", "Relaxation Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "Aromatherapy Certification"],
    languages: ["English", "Portuguese", "Spanish"],
    incall_price: 140,
    outcall_price: 190,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "20:00" }, Tuesday: { active: true, start: "10:00", end: "20:00" }, Wednesday: { active: true, start: "10:00", end: "20:00" }, Thursday: { active: true, start: "10:00", end: "20:00" }, Friday: { active: true, start: "10:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "12:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Relaxation", duration: 60, incall: 140, outcall: 190 },
      { name: "Deep Tissue", duration: 90, incall: 200, outcall: 260 },
      { name: "Aromatherapy Premium", duration: 120, incall: 260, outcall: 330 },
    ],
  },
  {
    email: "seed-mia-2@masseurmatch.internal",
    full_name: "Andrei Volkov",
    display_name: "Andrei Volkov",
    seed_slug: "andrei-volkov-miami",
    bio: "Originally trained in Saint Petersburg, Russia, I relocated to Miami Beach 3 years ago. I specialize in sports massage and rehabilitation bodywork. My clients include gym-goers, swimmers, and weekend athletes who need targeted recovery work. I take a no-nonsense approach — each session starts with an assessment of your current condition and goals. I work from my South Beach studio with flexible hours to fit busy schedules.",
    city: "Miami",
    state: "FL",
    country: "USA",
    specialties: ["Sports Massage", "Rehabilitation", "Deep Tissue", "Stretching"],
    certifications: ["Licensed Massage Therapist (LMT)", "Sports Rehab Specialist"],
    languages: ["English", "Russian"],
    incall_price: 130,
    outcall_price: 180,
    business_hours: { incall: { Monday: { active: true, start: "07:00", end: "15:00" }, Tuesday: { active: true, start: "07:00", end: "15:00" }, Wednesday: { active: true, start: "07:00", end: "15:00" }, Thursday: { active: true, start: "07:00", end: "15:00" }, Friday: { active: true, start: "07:00", end: "15:00" }, Saturday: { active: true, start: "08:00", end: "14:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Sports Massage", duration: 60, incall: 130, outcall: 180 },
      { name: "Recovery Session", duration: 90, incall: 190, outcall: 250 },
    ],
  },
  {
    email: "seed-mia-3@masseurmatch.internal",
    full_name: "Diego Morales",
    display_name: "Diego Morales",
    seed_slug: "diego-morales-miami",
    bio: "Licensed bodyworker in Wynwood with 6 years of practice. My training covers Swedish, hot stone, and neuromuscular therapy. I focus on creating a customized experience based on each client's needs. Whether you're dealing with chronic tension, recovering from travel, or simply need to unwind, I adapt my technique accordingly. My studio is clean, private, and designed for comfort.",
    city: "Miami",
    state: "FL",
    country: "USA",
    specialties: ["Swedish Massage", "Hot Stone", "Neuromuscular Therapy", "Relaxation Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English", "Spanish"],
    incall_price: 135,
    outcall_price: 185,
    business_hours: { incall: { Monday: { active: true, start: "11:00", end: "20:00" }, Tuesday: { active: true, start: "11:00", end: "20:00" }, Wednesday: { active: true, start: "11:00", end: "20:00" }, Thursday: { active: false, start: "09:00", end: "18:00" }, Friday: { active: true, start: "11:00", end: "20:00" }, Saturday: { active: true, start: "11:00", end: "19:00" }, Sunday: { active: true, start: "12:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 135, outcall: 185 },
      { name: "Hot Stone", duration: 90, incall: 195, outcall: 260 },
      { name: "Neuromuscular", duration: 90, incall: 210, outcall: 275 },
    ],
  },

  // ── San Francisco (3) ──
  {
    email: "seed-sf-1@masseurmatch.internal",
    full_name: "James Chen",
    display_name: "James Chen",
    seed_slug: "james-chen-san-francisco",
    bio: "San Francisco based massage therapist with 10+ years of experience in therapeutic bodywork. I hold certifications in neuromuscular therapy and craniosacral work. My practice focuses on chronic pain management and postural correction for tech professionals dealing with desk-related tension. I integrate multiple modalities into each session based on your specific needs. Located in SOMA with flexible scheduling including evenings and weekends.",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    specialties: ["Neuromuscular Therapy", "Craniosacral", "Deep Tissue", "Postural Correction"],
    certifications: ["Licensed Massage Therapist (LMT)", "Neuromuscular Therapy Certified", "Craniosacral Level 3"],
    languages: ["English", "Mandarin"],
    incall_price: 170,
    outcall_price: 220,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "20:00" }, Tuesday: { active: true, start: "09:00", end: "20:00" }, Wednesday: { active: true, start: "09:00", end: "20:00" }, Thursday: { active: true, start: "09:00", end: "20:00" }, Friday: { active: true, start: "09:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Therapeutic", duration: 60, incall: 170, outcall: 220 },
      { name: "Deep Tissue", duration: 90, incall: 240, outcall: 300 },
      { name: "Craniosacral", duration: 120, incall: 300, outcall: 370 },
    ],
  },
  {
    email: "seed-sf-2@masseurmatch.internal",
    full_name: "Kevin Patel",
    display_name: "Kevin Patel",
    seed_slug: "kevin-patel-san-francisco",
    bio: "Trained in both Ayurvedic bodywork and Western massage therapy, I offer a unique blend of techniques at my Castro district studio. With 4 years of professional experience, I create sessions that balance relaxation with therapeutic benefit. I work particularly well with clients experiencing anxiety-related tension, sleep difficulties, and general fatigue. Warm oil and heated table available for enhanced comfort.",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    specialties: ["Ayurvedic Massage", "Swedish Massage", "Relaxation Massage", "Aromatherapy"],
    certifications: ["Licensed Massage Therapist (LMT)", "Ayurvedic Bodywork Certificate"],
    languages: ["English", "Hindi", "Gujarati"],
    incall_price: 150,
    outcall_price: 200,
    business_hours: { incall: { Monday: { active: true, start: "11:00", end: "20:00" }, Tuesday: { active: true, start: "11:00", end: "20:00" }, Wednesday: { active: true, start: "11:00", end: "20:00" }, Thursday: { active: true, start: "11:00", end: "20:00" }, Friday: { active: true, start: "11:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "12:00", end: "17:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Ayurvedic", duration: 60, incall: 150, outcall: 200 },
      { name: "Swedish", duration: 90, incall: 210, outcall: 275 },
    ],
  },
  {
    email: "seed-sf-3@masseurmatch.internal",
    full_name: "Ryan Tanaka",
    display_name: "Ryan Tanaka",
    seed_slug: "ryan-tanaka-san-francisco",
    bio: "Professional bodyworker specializing in sports massage and injury prevention. Based in the Mission District, I've spent 7 years helping runners, cyclists, and CrossFit athletes perform and recover better. My approach is direct and results-oriented. I use deep tissue, active release, and PNF stretching to address specific movement restrictions. Not a spa experience — this is functional bodywork for people who push their bodies.",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    specialties: ["Sports Massage", "Active Release", "PNF Stretching", "Deep Tissue"],
    certifications: ["Licensed Massage Therapist (LMT)", "Active Release Technique (ART)"],
    languages: ["English", "Japanese"],
    incall_price: 160,
    outcall_price: 210,
    business_hours: { incall: { Monday: { active: true, start: "06:00", end: "14:00" }, Tuesday: { active: true, start: "06:00", end: "14:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "06:00", end: "14:00" }, Friday: { active: true, start: "06:00", end: "14:00" }, Saturday: { active: true, start: "07:00", end: "13:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Sports Massage", duration: 60, incall: 160, outcall: 210 },
      { name: "Recovery + Stretching", duration: 90, incall: 230, outcall: 290 },
    ],
  },

  // ── Chicago (3) ──
  {
    email: "seed-chi-1@masseurmatch.internal",
    full_name: "Andre Williams",
    display_name: "Andre Williams",
    seed_slug: "andre-williams-chicago",
    bio: "Chicago-based licensed massage therapist dedicated to helping clients achieve peak physical performance and deep relaxation. With 7 years of professional experience, I've developed expertise in sports massage, lymphatic drainage, and injury rehabilitation. I work with everyone from marathon runners to office workers experiencing chronic back pain. My approach considers your lifestyle and movement patterns. Available at my Lincoln Park studio or outcall throughout Chicago.",
    city: "Chicago",
    state: "IL",
    country: "USA",
    specialties: ["Sports Massage", "Lymphatic Drainage", "Injury Rehabilitation", "Deep Tissue"],
    certifications: ["Licensed Massage Therapist (LMT)", "Sports Massage Specialist"],
    languages: ["English"],
    incall_price: 130,
    outcall_price: 180,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: true, start: "09:00", end: "19:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Sports Massage", duration: 60, incall: 130, outcall: 180 },
      { name: "Deep Tissue", duration: 90, incall: 190, outcall: 250 },
      { name: "Rehab + Lymphatic", duration: 120, incall: 240, outcall: 310 },
    ],
  },
  {
    email: "seed-chi-2@masseurmatch.internal",
    full_name: "Marco Vitale",
    display_name: "Marco Vitale",
    seed_slug: "marco-vitale-chicago",
    bio: "Italian-trained bodyworker now based in Chicago's Lakeview neighborhood. I specialize in relaxation massage, hot stone therapy, and fascia work. With 5 years of practice, I take a gentle but effective approach that helps clients decompress and reset. My studio features a warm, minimalist environment. Sessions always begin with a brief conversation about your current physical state and what you'd like to focus on.",
    city: "Chicago",
    state: "IL",
    country: "USA",
    specialties: ["Relaxation Massage", "Hot Stone", "Fascia Work", "Swedish Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English", "Italian"],
    incall_price: 125,
    outcall_price: 175,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "20:00" }, Tuesday: { active: true, start: "10:00", end: "20:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "10:00", end: "20:00" }, Friday: { active: true, start: "10:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "11:00", end: "17:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 125, outcall: 175 },
      { name: "Hot Stone", duration: 90, incall: 185, outcall: 245 },
    ],
  },
  {
    email: "seed-chi-3@masseurmatch.internal",
    full_name: "Deshawn Carter",
    display_name: "Deshawn Carter",
    seed_slug: "deshawn-carter-chicago",
    bio: "Massage therapist and personal trainer with 3 years of bodywork experience. I combine my fitness background with therapeutic massage to help clients recover faster and move better. My training includes deep tissue, trigger point therapy, and active isolated stretching. Based in Wicker Park, I work primarily with active individuals who want to stay on top of their physical health. Direct, professional, and focused on results.",
    city: "Chicago",
    state: "IL",
    country: "USA",
    specialties: ["Deep Tissue", "Trigger Point", "Stretching", "Sports Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "NASM-CPT"],
    languages: ["English"],
    incall_price: 120,
    outcall_price: 165,
    business_hours: { incall: { Monday: { active: true, start: "07:00", end: "16:00" }, Tuesday: { active: true, start: "07:00", end: "16:00" }, Wednesday: { active: true, start: "07:00", end: "16:00" }, Thursday: { active: true, start: "07:00", end: "16:00" }, Friday: { active: true, start: "07:00", end: "16:00" }, Saturday: { active: true, start: "08:00", end: "14:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Deep Tissue", duration: 60, incall: 120, outcall: 165 },
      { name: "Sports Recovery", duration: 90, incall: 175, outcall: 230 },
    ],
  },

  // ── Seattle (2) ──
  {
    email: "seed-sea-1@masseurmatch.internal",
    full_name: "Nathan Olson",
    display_name: "Nathan Olson",
    seed_slug: "nathan-olson-seattle",
    bio: "Seattle-based massage therapist with 8 years of experience working in both clinical and private settings. I specialize in deep tissue, myofascial release, and cupping therapy. My Capitol Hill studio provides a professional, judgment-free space for all clients. I work with tech workers, hikers, and anyone dealing with the physical effects of the Pacific Northwest's active lifestyle. Evening appointments available.",
    city: "Seattle",
    state: "WA",
    country: "USA",
    specialties: ["Deep Tissue", "Myofascial Release", "Cupping Therapy", "Swedish Massage"],
    certifications: ["Licensed Massage Therapist (LMT)", "Cupping Therapy Certified"],
    languages: ["English"],
    incall_price: 145,
    outcall_price: 195,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "20:00" }, Tuesday: { active: true, start: "10:00", end: "20:00" }, Wednesday: { active: true, start: "10:00", end: "20:00" }, Thursday: { active: true, start: "10:00", end: "20:00" }, Friday: { active: true, start: "10:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Deep Tissue", duration: 60, incall: 145, outcall: 195 },
      { name: "Cupping + Deep Tissue", duration: 90, incall: 205, outcall: 270 },
    ],
  },
  {
    email: "seed-sea-2@masseurmatch.internal",
    full_name: "Liam Nguyen",
    display_name: "Liam Nguyen",
    seed_slug: "liam-nguyen-seattle",
    bio: "Licensed bodyworker in Seattle's International District. I specialize in Thai massage, shiatsu, and stretching-based bodywork. My sessions are performed on a floor mat using no oils — just compression, stretching, and pressure point work. With 5 years of training including time in Chiang Mai, I offer an authentic experience that improves flexibility, reduces tension, and promotes energy flow. Comfortable clothing recommended.",
    city: "Seattle",
    state: "WA",
    country: "USA",
    specialties: ["Thai Massage", "Shiatsu", "Stretching", "Acupressure"],
    certifications: ["Licensed Massage Therapist (LMT)", "Thai Massage Certificate (TMC)"],
    languages: ["English", "Vietnamese"],
    incall_price: 140,
    outcall_price: 190,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "19:00" }, Tuesday: { active: true, start: "10:00", end: "19:00" }, Wednesday: { active: true, start: "10:00", end: "19:00" }, Thursday: { active: false, start: "09:00", end: "18:00" }, Friday: { active: true, start: "10:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: true, start: "11:00", end: "16:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Thai Massage", duration: 60, incall: 140, outcall: 190 },
      { name: "Extended Thai", duration: 90, incall: 200, outcall: 260 },
    ],
  },

  // ── Houston (2) ──
  {
    email: "seed-hou-1@masseurmatch.internal",
    full_name: "Chris Jackson",
    display_name: "Chris Jackson",
    seed_slug: "chris-jackson-houston",
    bio: "Houston-based massage therapist with 6 years of experience. I work primarily with clients dealing with lower back pain, neck tension, and stress. My Montrose studio offers a quiet, private space for focused bodywork. Sessions combine deep tissue, trigger point therapy, and stretching. I take time to understand your specific concerns before we begin and adjust technique throughout the session based on your feedback.",
    city: "Houston",
    state: "TX",
    country: "USA",
    specialties: ["Deep Tissue", "Trigger Point", "Stretching", "Back Pain Relief"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English"],
    incall_price: 120,
    outcall_price: 170,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: true, start: "09:00", end: "19:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Therapeutic", duration: 60, incall: 120, outcall: 170 },
      { name: "Deep Tissue", duration: 90, incall: 175, outcall: 235 },
    ],
  },
  {
    email: "seed-hou-2@masseurmatch.internal",
    full_name: "Miguel Herrera",
    display_name: "Miguel Herrera",
    seed_slug: "miguel-herrera-houston",
    bio: "Bilingual massage therapist serving the Houston Heights and surrounding areas. With 4 years of experience, I offer Swedish, deep tissue, and hot stone massage. I trained at a respected Houston academy and continue to study new modalities. My focus is on providing a consistent, reliable experience — clients know what to expect and can count on professional service every time. Outcall available within the 610 Loop.",
    city: "Houston",
    state: "TX",
    country: "USA",
    specialties: ["Swedish Massage", "Deep Tissue", "Hot Stone", "Relaxation Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English", "Spanish"],
    incall_price: 115,
    outcall_price: 165,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "20:00" }, Tuesday: { active: true, start: "10:00", end: "20:00" }, Wednesday: { active: true, start: "10:00", end: "20:00" }, Thursday: { active: true, start: "10:00", end: "20:00" }, Friday: { active: true, start: "10:00", end: "20:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "12:00", end: "17:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 115, outcall: 165 },
      { name: "Hot Stone", duration: 90, incall: 170, outcall: 230 },
    ],
  },

  // ── Atlanta (2) ──
  {
    email: "seed-atl-1@masseurmatch.internal",
    full_name: "Terrence Brooks",
    display_name: "Terrence Brooks",
    seed_slug: "terrence-brooks-atlanta",
    bio: "Licensed massage therapist in Midtown Atlanta with 5 years of practice. I specialize in deep tissue and neuromuscular therapy for clients with chronic pain and mobility issues. My background in exercise science informs my bodywork — I understand how muscles interact and where compensatory patterns develop. Sessions are structured and goal-oriented. I keep detailed notes between appointments to track your progress over time.",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    specialties: ["Deep Tissue", "Neuromuscular Therapy", "Therapeutic Massage", "Stretching"],
    certifications: ["Licensed Massage Therapist (LMT)", "BS Exercise Science"],
    languages: ["English"],
    incall_price: 130,
    outcall_price: 180,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: true, start: "09:00", end: "19:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "16:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Therapeutic", duration: 60, incall: 130, outcall: 180 },
      { name: "Neuromuscular", duration: 90, incall: 190, outcall: 250 },
    ],
  },
  {
    email: "seed-atl-2@masseurmatch.internal",
    full_name: "Kofi Mensah",
    display_name: "Kofi Mensah",
    seed_slug: "kofi-mensah-atlanta",
    bio: "Originally from Ghana, I've been practicing massage therapy in Atlanta for 4 years. My specialty is combining West African bodywork traditions with Swedish and deep tissue techniques. I'm based in the West End and travel throughout the metro area for outcall appointments. My approach is intuitive — I listen to what your body is telling me and adjust accordingly. I create a warm, respectful environment for every client.",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    specialties: ["Swedish Massage", "Deep Tissue", "Relaxation Massage", "Therapeutic Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English", "Twi", "French"],
    incall_price: 120,
    outcall_price: 170,
    business_hours: { incall: { Monday: { active: true, start: "10:00", end: "19:00" }, Tuesday: { active: true, start: "10:00", end: "19:00" }, Wednesday: { active: false, start: "09:00", end: "18:00" }, Thursday: { active: true, start: "10:00", end: "19:00" }, Friday: { active: true, start: "10:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "18:00" }, Sunday: { active: true, start: "12:00", end: "17:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 120, outcall: 170 },
      { name: "Deep Tissue", duration: 90, incall: 175, outcall: 235 },
    ],
  },

  // ── Denver (1) ──
  {
    email: "seed-den-1@masseurmatch.internal",
    full_name: "Tyler Morrison",
    display_name: "Tyler Morrison",
    seed_slug: "tyler-morrison-denver",
    bio: "Denver-based massage therapist with 5 years of experience. I work out of my Capitol Hill studio and specialize in deep tissue, trigger point therapy, and sports massage. Most of my clients are outdoor enthusiasts — skiers, climbers, trail runners — who need targeted recovery work. I'm straightforward about what massage can and can't do, and I always provide self-care recommendations to extend the benefits of each session.",
    city: "Denver",
    state: "CO",
    country: "USA",
    specialties: ["Deep Tissue", "Trigger Point", "Sports Massage", "Therapeutic Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English"],
    incall_price: 130,
    outcall_price: 180,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: true, start: "09:00", end: "19:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "09:00", end: "16:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Deep Tissue", duration: 60, incall: 130, outcall: 180 },
      { name: "Sports Recovery", duration: 90, incall: 190, outcall: 250 },
    ],
  },

  // ── Dallas (1) ──
  {
    email: "seed-dal-1@masseurmatch.internal",
    full_name: "Brandon Lee",
    display_name: "Brandon Lee",
    seed_slug: "brandon-lee-dallas",
    bio: "Licensed massage therapist in Dallas' Oak Lawn area with 6 years of experience. I provide Swedish, deep tissue, and therapeutic massage in a clean, professional studio environment. My clients range from corporate professionals to active adults. I believe massage should be accessible and effective — no pretense, just quality bodywork. Walk-ins welcome when available, or book ahead for guaranteed scheduling.",
    city: "Dallas",
    state: "TX",
    country: "USA",
    specialties: ["Swedish Massage", "Deep Tissue", "Therapeutic Massage", "Chair Massage"],
    certifications: ["Licensed Massage Therapist (LMT)"],
    languages: ["English"],
    incall_price: 120,
    outcall_price: 170,
    business_hours: { incall: { Monday: { active: true, start: "09:00", end: "19:00" }, Tuesday: { active: true, start: "09:00", end: "19:00" }, Wednesday: { active: true, start: "09:00", end: "19:00" }, Thursday: { active: true, start: "09:00", end: "19:00" }, Friday: { active: true, start: "09:00", end: "19:00" }, Saturday: { active: true, start: "10:00", end: "17:00" }, Sunday: { active: false, start: "09:00", end: "18:00" } }, outcall: {} },
    pricing_sessions: [
      { name: "Swedish", duration: 60, incall: 120, outcall: 170 },
      { name: "Deep Tissue", duration: 90, incall: 175, outcall: 235 },
    ],
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

    for (const seed of SEED_PROFILES) {
      // Check if seed with this slug already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, seed_slug")
        .eq("seed_slug", seed.seed_slug)
        .maybeSingle();

      if (existingProfile) {
        results.push(`⏭️ ${seed.display_name} (${seed.city}) — already exists`);
        continue;
      }

      // Check if email already exists in auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u: any) => u.email === seed.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        results.push(`♻️ ${seed.display_name} — reusing existing auth user`);
      } else {
        // Create auth user (random password — these are placeholder accounts)
        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
          email: seed.email,
          password: crypto.randomUUID(),
          email_confirm: true,
          user_metadata: { full_name: seed.full_name },
        });

        if (userError) {
          results.push(`❌ ${seed.display_name}: ${userError.message}`);
          continue;
        }
        userId = newUser.user.id;
      }

      // Upsert profile with seed flags
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: userId,
        full_name: seed.full_name,
        display_name: seed.display_name,
        bio: seed.bio,
        city: seed.city,
        state: seed.state,
        country: seed.country,
        specialties: seed.specialties,
        certifications: seed.certifications,
        languages: seed.languages,
        incall_price: seed.incall_price,
        outcall_price: seed.outcall_price,
        business_hours: seed.business_hours,
        pricing_sessions: seed.pricing_sessions,
        payment_methods: ["Cash", "Venmo", "Zelle"],
        // Seed-specific fields
        is_seed_profile: true,
        seed_slug: seed.seed_slug,
        // Active for directory visibility but NOT verified (honest)
        is_active: true,
        status: "active",
        is_verified_profile: false,
        is_verified_identity: false,
        is_verified_photos: false,
        is_verified_phone: false,
      }, { onConflict: "user_id" });

      if (profileError) {
        results.push(`⚠️ ${seed.display_name}: ${profileError.message}`);
      } else {
        results.push(`✅ ${seed.display_name} (${seed.city}) — created`);
      }
    }

    // Audit log
    await supabase.from("audit_log").insert({
      admin_user_id: user.id,
      action: "seed_profiles_created",
      target_type: "system",
      details: { count: SEED_PROFILES.length, results },
    });

    return new Response(JSON.stringify({ success: true, total: SEED_PROFILES.length, results }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
