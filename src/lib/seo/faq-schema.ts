/**
 * FAQ Schema Generator for MasseurMatch City Pages
 * Generates JSON-LD structured data for Google Rich Results
 * Supports universal and city-specific FAQ sets
 */

export type FAQItem = {
  question: string;
  answer: string;
  keywords?: string[];
  linkText?: string;
  linkHref?: string;
};

export type FAQSchema = {
  universal: FAQItem[];
  citiesMap: Record<string, FAQItem[]>;
};

/**
 * Universal FAQ set (applies to all cities)
 * 60-120 words per answer, SEO-optimized with natural keyword integration
 */
export const universalFAQ: FAQItem[] = [
  {
    question: "What makes a massage therapist LGBTQ+ affirming?",
    answer:
      "LGBTQ+ affirming therapists actively welcome and support clients of all sexual orientations and gender identities. They use chosen names and pronouns, respect gender diversity, and create a judgment-free space. Every therapist on MasseurMatch has committed to these values, and we verify this during our review process. This means you can book with confidence, knowing your identity is respected.",
    keywords: ["LGBTQ+ affirming therapists", "inclusive massage therapy"],
    linkText: "Learn about our verification process",
    linkHref: "/about-verification",
  },
  {
    question: "How does MasseurMatch verify therapists?",
    answer:
      "All therapists complete our verification process before going live. We confirm identity, LGBTQ+ affirmation commitment, and contact information. Each profile is reviewed to ensure authenticity and safety. While we don't perform background checks ourselves, we encourage clients to research therapists thoroughly and trust their instincts. Our community ratings and reviews help build confidence over time.",
    keywords: ["therapist verification", "MasseurMatch review process"],
    linkText: "See our verification standards",
    linkHref: "/verification-standards",
  },
  {
    question: "What's the difference between in-call and out-call massage?",
    answer:
      "In-call means you visit the therapist's private studio or location. Out-call means the therapist travels to your home, hotel, or agreed location. In-call usually offers a dedicated space, while out-call provides convenience at your location. Pricing, availability, and cancellation policies may differ. Check each therapist's profile to see which services they offer and their rates.",
    keywords: ["in-call massage", "out-call massage", "massage location options"],
    linkText: "Browse therapists by service type",
    linkHref: "/search",
  },
  {
    question: "How much does a massage cost?",
    answer:
      "Session costs vary by therapist, location, modality, and duration. Most therapists charge between $60–200+ per hour, with some offering 30-minute or 90-minute sessions. Premium and specialty modalities (deep tissue, myofascial release) may cost more. Visit individual therapist profiles to see exact pricing. Many therapists offer first-time discounts or package rates.",
    keywords: ["massage cost", "session pricing", "therapy rates"],
    linkText: "Compare therapist rates",
    linkHref: "/search?sort=price",
  },
  {
    question: "How do I know if a therapist is right for me?",
    answer:
      "Review their profile thoroughly: read their bio, check specialties, modalities, and client reviews. Many profiles include photos and detailed descriptions of their style. Look for shared values—whether they emphasize relaxation, deep work, or specific techniques. Don't hesitate to contact them directly with questions about their approach, availability, or experience with your specific needs.",
    keywords: ["choosing a therapist", "finding the right massage therapist"],
    linkText: "Read therapist profiles and reviews",
    linkHref: "/search",
  },
  {
    question: "Can I book same-day?",
    answer:
      "Same-day availability depends on the individual therapist. Many therapists keep slots open for last-minute bookings, while others book weeks in advance. Check their calendar or contact them directly via phone, text, or WhatsApp (listed on their profile) to ask about same-day availability. Popular time slots fill quickly, so earlier in the day often has better chances.",
    keywords: ["same-day massage booking", "last-minute appointments"],
    linkText: "Search available therapists",
    linkHref: "/search",
  },
  {
    question: "What should I ask before booking?",
    answer:
      "Ask about their experience with your specific needs, modalities they specialize in, session length, pricing, cancellation policy, and payment methods. For out-call, confirm the address, parking, and whether they bring a massage table. Discuss any injuries, medical conditions, or pressure preferences. A good therapist will welcome these questions and take time to ensure you're a good fit.",
    keywords: ["questions to ask massage therapist", "pre-booking consultation"],
    linkText: "View therapist contact options",
    linkHref: "/search",
  },
  {
    question: "Are therapists background-checked?",
    answer:
      "MasseurMatch does not perform background checks on therapists. However, we do verify identity and contact information. We encourage clients to review profiles, read other client feedback, and trust their instincts. Always feel comfortable asking therapists about their credentials, experience, and approach before booking.",
    keywords: ["background checks", "therapist safety"],
    linkText: "Read community reviews",
    linkHref: "/search",
  },
  {
    question: "How do reviews work?",
    answer:
      "After a session, clients can rate and review their experience on the therapist's profile. Reviews are anonymous unless you choose to share your name. They help build a community of honest feedback and help future clients make informed decisions. Only verified bookings can post reviews. This keeps our review system trustworthy and authentic.",
    keywords: ["therapist reviews", "rating system", "client feedback"],
    linkText: "See how reviews help",
    linkHref: "/how-reviews-work",
  },
  {
    question: "What modalities are available?",
    answer:
      "MasseurMatch features therapists specializing in Swedish, deep tissue, sports massage, myofascial release, Thai, reflexology, tantric, prostate, and more. Each therapist lists their specialties on their profile. Use the search filters to find therapists by modality. If you're unsure which modality suits you, contact a therapist directly—they can advise based on your goals.",
    keywords: ["massage modalities", "specialty massage types"],
    linkText: "Filter by modality",
    linkHref: "/search?filters=modality",
  },
  {
    question: "Do therapists speak other languages?",
    answer:
      "Yes, some therapists speak languages beyond English. Check each therapist's profile for language information. If a language isn't listed, contact the therapist directly—they may accommodate you. MasseurMatch is English-primary for now, but our community spans diverse backgrounds.",
    keywords: ["multilingual therapists", "language options"],
    linkText: "Search therapist profiles",
    linkHref: "/search",
  },
  {
    question: "Is my information private?",
    answer:
      "Your privacy is essential. Client information (name, email, phone, booking details) is never shared with other clients or published on profiles. Therapists only see what you choose to communicate. MasseurMatch follows strict data privacy practices and complies with applicable regulations. Read our privacy policy for full details.",
    keywords: ["privacy", "data protection", "client confidentiality"],
    linkText: "Read our privacy policy",
    linkHref: "/privacy",
  },
];

/**
 * City-specific FAQ additions
 * 4-6 questions per major city
 */
export const cityFAQ: Record<string, FAQItem[]> = {
  dallas: [
    {
      question: "What are the best neighborhoods for massage in Dallas?",
      answer:
        "Oak Lawn and Uptown are Dallas's most vibrant LGBTQ+ neighborhoods with excellent therapist availability. Downtown and Deep Ellum also have strong communities. Many therapists service the entire Dallas area for out-call. Check individual profiles for their in-call location and service area. Proximity matters for in-call, so filter by neighborhood if location is important to you.",
      keywords: ["Dallas neighborhoods", "Oak Lawn massage", "Uptown therapists"],
      linkText: "Search Dallas therapists by area",
      linkHref: "/search?city=dallas",
    },
    {
      question: "Are therapists available in Oak Lawn and Uptown?",
      answer:
        "Yes, Oak Lawn and Uptown have multiple verified therapists on MasseurMatch. Many have studios in these neighborhoods and offer both in-call and out-call services. These areas are popular for bookings, so availability can fill quickly during peak times. Search by location or contact therapists directly to check their schedules.",
      keywords: ["Oak Lawn massage", "Uptown therapists", "Dallas LGBTQ+ neighborhoods"],
      linkText: "View Oak Lawn & Uptown therapists",
      linkHref: "/search?city=dallas&neighborhood=oak-lawn-uptown",
    },
    {
      question: "What's the fastest way to book in Dallas?",
      answer:
        "Use the search filter to sort by availability or response time. Many Dallas therapists keep open slots and respond to texts or calls within hours. For same-day bookings, call or text directly—listed on each profile. Afternoon and evening slots often have better availability than morning. Weekday appointments may be easier to secure than weekends.",
      keywords: ["quick booking Dallas", "same-day massage Dallas"],
      linkText: "Search available Dallas therapists now",
      linkHref: "/search?city=dallas&sort=availability",
    },
    {
      question: "Can I book out-call sessions throughout Dallas?",
      answer:
        "Many Dallas therapists offer out-call throughout the city and surrounding areas. Service areas vary—some therapists cover the entire metroplex, others focus on specific neighborhoods. Check their profile for service radius or contact them directly. Out-call pricing may include a travel fee depending on distance.",
      keywords: ["Dallas out-call massage", "mobile massage Dallas"],
      linkText: "Filter by out-call service",
      linkHref: "/search?city=dallas&serviceType=outcall",
    },
    {
      question: "How do I find therapists who specialize in a specific modality in Dallas?",
      answer:
        "Use the modality filter on the search page to narrow by specialty (deep tissue, sports massage, Thai, etc.). Dallas therapists cover the full range. Read profiles to confirm expertise and experience with your specific needs. You can also message therapists directly to ask about their training and approach.",
      keywords: ["Dallas massage modalities", "specialty therapists Dallas"],
      linkText: "Filter Dallas by modality",
      linkHref: "/search?city=dallas&filters=modality",
    },
  ],
  houston: [
    {
      question: "Where can I find LGBTQ+-affirming therapists in Montrose?",
      answer:
        "Montrose is Houston's primary LGBTQ+ neighborhood and has excellent therapist availability on MasseurMatch. Many therapists have studios or regularly service the Montrose area. Search by neighborhood or browse profiles to find therapists who list Montrose as their in-call location or service area. Montrose therapists are experienced with diverse clientele.",
      keywords: ["Montrose therapists", "Houston LGBTQ+ massage", "Montrose massage"],
      linkText: "Find Montrose therapists",
      linkHref: "/search?city=houston&neighborhood=montrose",
    },
    {
      question: "What modalities are most popular in Houston?",
      answer:
        "Deep tissue, Swedish, and sports massage are popular in Houston, reflecting the city's active lifestyle. Many therapists also specialize in prostate massage, tantric sessions, and myofascial release. Houston's heat and humidity make therapeutic massage especially popular. Search by modality to find specialists, or ask individual therapists about their most requested services.",
      keywords: ["Houston massage modalities", "popular massage types Houston"],
      linkText: "Explore Houston massage specialties",
      linkHref: "/search?city=houston&filters=modality",
    },
    {
      question: "How does out-call work in Houston hotels?",
      answer:
        "Many Houston therapists offer hotel out-call services. When booking, confirm the therapist services hotels and your specific location. Provide the hotel name, room number, and check-in time. Most therapists bring a portable massage table. Some hotels have restrictions—check your hotel's guest policy. Therapists typically ask for discretion and appreciate clear directions to your room.",
      keywords: ["hotel massage Houston", "out-call hotel services"],
      linkText: "Search hotel-friendly therapists",
      linkHref: "/search?city=houston&serviceType=outcall",
    },
    {
      question: "What's the typical massage cost in Houston?",
      answer:
        "Houston massage rates typically range from $70–200+ per hour, depending on modality, therapist experience, and location. In-call sessions in Montrose studios may differ from out-call hotel services. Many therapists offer first-time discounts or package rates for returning clients. Check individual profiles for exact pricing and any specials.",
      keywords: ["Houston massage pricing", "massage cost Houston"],
      linkText: "Compare Houston pricing",
      linkHref: "/search?city=houston&sort=price",
    },
    {
      question: "How do I contact a therapist in Houston?",
      answer:
        "Each therapist profile lists their preferred contact methods: phone, text, WhatsApp, or email. Most Houston therapists respond quickly to texts and calls. Include your name, desired service (in-call or out-call), date/time, and modality preference. Professional, clear communication helps secure your booking faster.",
      keywords: ["Houston therapist contact", "booking Houston massage"],
      linkText: "View therapist contacts",
      linkHref: "/search?city=houston",
    },
  ],
  austin: [
    {
      question: "What makes Austin's massage scene different?",
      answer:
        "Austin's culture emphasizes wellness, inclusivity, and authenticity—reflected in its thriving massage community. Austin therapists tend to blend modalities creatively and welcome conversations about holistic health. The city's laid-back vibe attracts therapists who prioritize personal connection and tailored sessions. Austin's outdoor lifestyle also drives demand for sports massage and recovery work.",
      keywords: ["Austin massage scene", "Austin wellness community"],
      linkText: "Explore Austin therapists",
      linkHref: "/search?city=austin",
    },
    {
      question: "Where are therapists located in East Austin and Downtown?",
      answer:
        "East Austin and Downtown have growing massage communities. Many therapists have studios near Congress Avenue, East 6th Street, and surrounding neighborhoods. Some offer both in-call and out-call throughout Austin. Check profiles for exact locations. Austin's bikeable neighborhoods mean many therapists are accessible via public transit.",
      keywords: ["East Austin massage", "Downtown Austin therapists"],
      linkText: "Find East Austin & Downtown therapists",
      linkHref: "/search?city=austin&neighborhood=east-downtown",
    },
    {
      question: "Is same-day availability common in Austin?",
      answer:
        "Austin therapists vary in availability. Some keep slots open for last-minute bookings, while others book weeks ahead during peak seasons. Text or call directly—listed on profiles—for same-day inquiries. Early morning or late evening often has better availability. Weekday afternoons tend to be more flexible than weekends.",
      keywords: ["Austin same-day massage", "last-minute appointments Austin"],
      linkText: "Search available Austin therapists",
      linkHref: "/search?city=austin&sort=availability",
    },
    {
      question: "What payment methods do Austin therapists accept?",
      answer:
        "Most Austin therapists accept cash, Venmo, card payments, or digital wallets. Check individual profiles for their preferred methods. Some therapists require deposit or prepayment via Venmo or PayPal. Always confirm payment details when booking, especially for out-call sessions.",
      keywords: ["Austin massage payment", "payment methods therapists"],
      linkText: "View therapist details",
      linkHref: "/search?city=austin",
    },
    {
      question: "Can I book therapists outside Austin proper?",
      answer:
        "Yes, some MasseurMatch therapists service greater Austin and surrounding areas like Round Rock, Cedar Park, and Pflugerville. Check profiles for their service radius. Out-call rates may include travel fees for farther distances. Contact therapists directly to confirm they service your location.",
      keywords: ["Austin area massage", "greater Austin therapists"],
      linkText: "Search Austin area",
      linkHref: "/search?city=austin",
    },
  ],
};

/**
 * Generate JSON-LD FAQ schema for a page
 * @param faqItems Array of FAQ items to include
 * @param pageUrl Full URL of the page (for @id)
 * @returns JSON-LD compatible object
 */
export function generateFAQSchema(faqItems: FAQItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Get combined FAQ set for a city (universal + city-specific)
 * @param city City slug (e.g., "dallas", "houston", "austin")
 * @returns Array of all FAQ items for that city
 */
export function getCityFAQ(city: string): FAQItem[] {
  const citySpecific = cityFAQ[city.toLowerCase()] || [];
  return [...universalFAQ, ...citySpecific];
}

/**
 * Get JSON-LD schema for a city page
 * @param city City slug
 * @param pageUrl Full page URL
 * @returns JSON-LD object ready for Next.js metadata
 */
export function getCityFAQSchema(city: string, pageUrl: string) {
  const items = getCityFAQ(city);
  return generateFAQSchema(items, pageUrl);
}
