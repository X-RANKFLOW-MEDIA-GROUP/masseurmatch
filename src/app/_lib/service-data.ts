// Service/modality metadata for national SEO strategy
export type ServiceSlug = "deep-tissue" | "swedish" | "sports" | "thai" | "mobile" | "hotel" | "lymphatic" | "hot-stone";

export type ServiceMetadata = {
  slug: ServiceSlug;
  label: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  primaryKeyword: string;
  longTailKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const NATIONAL_SERVICE_SLUGS: ServiceSlug[] = [
  "deep-tissue",
  "swedish",
  "sports",
  "thai",
  "mobile",
  "hotel",
  "lymphatic",
  "hot-stone",
];

export const SERVICE_METADATA: Record<ServiceSlug, ServiceMetadata> = {
  "deep-tissue": {
    slug: "deep-tissue",
    label: "Deep Tissue",
    title: "Deep Tissue Massage Therapists | MasseurMatch",
    h1: "Deep Tissue Massage Therapists",
    description:
      "Find verified deep tissue massage therapists across the US. Compare specialties, pricing, incall & outcall options, and direct contact therapists who focus on muscle recovery and tension relief.",
    intro:
      "Deep tissue massage uses concentrated pressure to address muscle tension, recovery, and chronic pain. Browse MasseurMatch therapists who specialize in deep tissue work, compare session formats (incall, outcall, mobile), and contact providers directly.",
    primaryKeyword: "deep tissue massage therapist",
    longTailKeywords: [
      "deep tissue massage near me",
      "deep tissue massage therapist near me",
      "best deep tissue massage",
      "deep tissue sports massage",
      "deep tissue massage for athletes",
      "therapeutic deep tissue massage",
    ],
    faqs: [
      {
        question: "What is deep tissue massage?",
        answer:
          "Deep tissue massage uses slow strokes and sustained pressure to target muscle layers and connective tissue. It's often used for muscle recovery, tension relief, and managing chronic pain.",
      },
      {
        question: "How do I find a deep tissue massage therapist?",
        answer:
          "Search MasseurMatch for deep tissue therapists in your city. Filter by session type (incall, outcall, mobile), compare pricing and experience, then contact your chosen therapist directly.",
      },
      {
        question: "Is deep tissue massage painful?",
        answer:
          "Deep tissue work involves pressure but should not be painful. Quality therapists communicate with clients about comfort levels and adjust pressure accordingly. Discuss any concerns with your therapist beforehand.",
      },
      {
        question: "How often should I get deep tissue massage?",
        answer:
          "Frequency depends on your needs and recovery goals. Some people benefit from weekly sessions, others monthly. Discuss frequency with your therapist based on your goals.",
      },
    ],
  },

  swedish: {
    slug: "swedish",
    label: "Swedish Massage",
    title: "Swedish Massage Therapists | MasseurMatch",
    h1: "Swedish Massage Therapists",
    description:
      "Discover verified Swedish massage therapists nationwide. Swedish massage uses long flowing strokes for relaxation and circulation. Compare therapists, session types, and book your appointment.",
    intro:
      "Swedish massage emphasizes relaxation, improved circulation, and overall wellness through long gliding strokes and kneading. Find MasseurMatch therapists who specialize in Swedish technique, available for incall, outcall, and mobile sessions.",
    primaryKeyword: "Swedish massage therapist",
    longTailKeywords: [
      "Swedish massage near me",
      "Swedish massage therapist near me",
      "relaxation massage",
      "classic massage therapy",
      "Swedish massage for relaxation",
      "therapeutic massage Swedish",
    ],
    faqs: [
      {
        question: "What is Swedish massage?",
        answer:
          "Swedish massage uses long, flowing strokes, kneading, and rhythmic movements to promote relaxation, improve circulation, and reduce muscle tension. It's one of the most common massage styles.",
      },
      {
        question: "Who benefits from Swedish massage?",
        answer:
          "Swedish massage is suitable for most people seeking relaxation, stress relief, and improved circulation. It's a good starting point if you're new to massage or prefer gentler pressure.",
      },
      {
        question: "How long does a Swedish massage session take?",
        answer:
          "Standard sessions are typically 60 or 90 minutes. Many therapists also offer 30-minute express sessions for quick stress relief or maintenance.",
      },
      {
        question: "Can Swedish massage help with pain relief?",
        answer:
          "While Swedish massage is primarily relaxation-focused, improved circulation and muscle relaxation can help reduce mild muscle tension and pain. For chronic pain, deep tissue or therapeutic massage may be more effective.",
      },
    ],
  },

  sports: {
    slug: "sports",
    label: "Sports Massage",
    title: "Sports Massage Therapists | MasseurMatch",
    h1: "Sports Massage Therapists",
    description:
      "Find verified sports massage therapists across the US. Specializing in athletic recovery, injury prevention, and performance. Compare therapists and book your sports massage session.",
    intro:
      "Sports massage is designed for athletes and active individuals to enhance performance, speed recovery, and prevent injury. Discover MasseurMatch therapists who work with athletes, offering pre-event and post-event massage.",
    primaryKeyword: "sports massage therapist",
    longTailKeywords: [
      "sports massage near me",
      "sports massage therapist near me",
      "athletic massage",
      "post-workout massage",
      "injury recovery massage",
      "performance massage therapy",
      "sports recovery massage",
    ],
    faqs: [
      {
        question: "What is sports massage?",
        answer:
          "Sports massage is specialized massage therapy designed for athletes. It focuses on enhancing performance, speeding recovery from workouts, and preventing or treating sports-related injuries.",
      },
      {
        question: "When should athletes get sports massage?",
        answer:
          "Pre-event (before competition), post-event (after competition), and during training phases. Regular maintenance massage during training season helps prevent injury and improves performance.",
      },
      {
        question: "What's the difference between sports massage and deep tissue?",
        answer:
          "Sports massage is specifically designed for athletic performance and recovery, using techniques tailored to athletic needs. Deep tissue is broader and used for general muscle tension and pain relief.",
      },
      {
        question: "How can sports massage help my performance?",
        answer:
          "Sports massage improves flexibility, increases blood flow, reduces muscle tension, and speeds recovery. Regular sessions can enhance endurance, prevent injuries, and optimize athletic performance.",
      },
    ],
  },

  thai: {
    slug: "thai",
    label: "Thai Massage",
    title: "Thai Massage Therapists | MasseurMatch",
    h1: "Thai Massage Therapists",
    description:
      "Discover verified Thai massage therapists nationwide. Traditional Thai massage combines stretching and acupressure for flexibility and energy balance. Find and book with therapists today.",
    intro:
      "Thai massage is an ancient healing practice combining acupressure, stretching, and energy work along body lines (sen). Find MasseurMatch therapists trained in traditional Thai technique, available for incall and outcall sessions.",
    primaryKeyword: "Thai massage therapist",
    longTailKeywords: [
      "Thai massage near me",
      "Thai massage therapist near me",
      "traditional Thai massage",
      "Thai stretch massage",
      "Thai massage for flexibility",
      "authentic Thai massage",
    ],
    faqs: [
      {
        question: "What is Thai massage?",
        answer:
          "Thai massage is an ancient healing practice using acupressure, stretching, and guided movement along energy lines called 'sen'. It promotes flexibility, energy balance, and overall wellness.",
      },
      {
        question: "Is Thai massage painful?",
        answer:
          "Thai massage involves stretching and pressure but should feel therapeutic, not painful. Quality practitioners adjust intensity based on your comfort. Communication with your therapist is key.",
      },
      {
        question: "What should I wear for Thai massage?",
        answer:
          "Thai massage is typically done fully clothed in comfortable, loose-fitting clothing. Many therapists provide comfortable pants and shirts if needed.",
      },
      {
        question: "What are the benefits of Thai massage?",
        answer:
          "Benefits include improved flexibility, reduced muscle tension, better energy flow, stress relief, and improved circulation. Many people report feeling energized and relaxed after sessions.",
      },
    ],
  },

  mobile: {
    slug: "mobile",
    label: "Mobile/Outcall Massage",
    title: "Mobile Massage Therapists | MasseurMatch",
    h1: "Mobile & Outcall Massage Therapists",
    description:
      "Find mobile and outcall massage therapists who come to you. Browse verified therapists offering convenient at-home, hotel, or office massage services across the US.",
    intro:
      "Mobile and outcall massage therapists bring therapeutic sessions directly to your home, hotel, or office. Discover MasseurMatch therapists offering convenient outcall services with the same professional standards as studio massage.",
    primaryKeyword: "mobile massage therapist",
    longTailKeywords: [
      "mobile massage near me",
      "outcall massage",
      "massage at home",
      "hotel massage",
      "in-home massage therapy",
      "outcall massage therapist near me",
    ],
    faqs: [
      {
        question: "What is mobile or outcall massage?",
        answer:
          "Mobile and outcall massage means the therapist travels to your location (home, hotel, office) for the session. You get professional massage therapy without traveling to a studio.",
      },
      {
        question: "How do I book an outcall massage?",
        answer:
          "Find a mobile massage therapist on MasseurMatch, review their profile and pricing, then contact them directly to schedule an appointment and confirm location details.",
      },
      {
        question: "What should I prepare for an outcall massage?",
        answer:
          "Ensure you have a quiet, comfortable space for the session. The therapist will typically bring a portable massage table and all needed supplies. Just provide a clean, private area.",
      },
      {
        question: "Is outcall massage more expensive?",
        answer:
          "Outcall massage may have different pricing than incall due to travel time and setup. Many therapists price competitively or offer package deals. Check individual therapist rates.",
      },
    ],
  },

  hotel: {
    slug: "hotel",
    label: "Hotel Massage",
    title: "Hotel Massage Therapists | MasseurMatch",
    h1: "Hotel & Travel Massage Therapists",
    description:
      "Book professional hotel massage services in your city. Find verified massage therapists who provide in-room massage at hotels and accommodations across the US.",
    intro:
      "Hotel massage brings relaxation and recovery directly to your hotel room or vacation rental. Discover MasseurMatch therapists specializing in travel and hotel massage services in major cities.",
    primaryKeyword: "hotel massage service",
    longTailKeywords: [
      "hotel massage near me",
      "massage in hotel room",
      "traveling massage therapist",
      "in-room hotel massage",
      "business travel massage",
      "vacation massage service",
    ],
    faqs: [
      {
        question: "What is hotel massage?",
        answer:
          "Hotel massage is professional massage therapy provided in your hotel room or accommodation. Perfect for travelers seeking stress relief, recovery from travel fatigue, or general wellness.",
      },
      {
        question: "Can I book massage in any hotel?",
        answer:
          "Most hotels support in-room massage services. Check with your hotel's concierge or call MasseurMatch therapists directly who offer hotel sessions in your area.",
      },
      {
        question: "How do I arrange hotel massage?",
        answer:
          "Contact a MasseurMatch therapist who offers hotel services. Confirm your hotel, room availability, and preferred session time. They'll handle setup and bring all necessary equipment.",
      },
      {
        question: "What's the typical cost of hotel massage?",
        answer:
          "Hotel massage pricing varies by therapist, location, and session length. Browse MasseurMatch listings to compare rates, or contact therapists directly for quotes.",
      },
    ],
  },

  lymphatic: {
    slug: "lymphatic",
    label: "Lymphatic Drainage",
    title: "Lymphatic Drainage Massage Therapists | MasseurMatch",
    h1: "Lymphatic Drainage Massage Therapists",
    description:
      "Find certified lymphatic drainage massage therapists. Specialized technique to support immune function and reduce swelling. Discover verified therapists across the US.",
    intro:
      "Lymphatic drainage massage uses gentle techniques to stimulate lymph flow, supporting immune function and reducing swelling. Find MasseurMatch therapists trained in this specialized technique.",
    primaryKeyword: "lymphatic drainage massage",
    longTailKeywords: [
      "lymphatic drainage massage near me",
      "lymphatic drainage therapy",
      "lymphatic massage for swelling",
      "manual lymphatic drainage",
      "certified lymphatic drainage",
    ],
    faqs: [
      {
        question: "What is lymphatic drainage massage?",
        answer:
          "Lymphatic drainage is a gentle massage technique that stimulates the lymphatic system, helping the body remove toxins and excess fluid. It supports immune function and reduces swelling.",
      },
      {
        question: "Who benefits from lymphatic drainage?",
        answer:
          "People with swelling, post-surgical patients, those with lymphedema, and individuals seeking immune support benefit from lymphatic drainage. It's gentle and safe for most people.",
      },
      {
        question: "Is lymphatic drainage massage painful?",
        answer:
          "No, lymphatic drainage is very gentle and should feel relaxing. The therapist uses light pressure and slow movements, making it very comfortable.",
      },
      {
        question: "How often should I get lymphatic drainage?",
        answer:
          "Frequency depends on your specific needs. Some people benefit from regular weekly sessions, while others do occasional maintenance. Discuss frequency with your therapist.",
      },
    ],
  },

  "hot-stone": {
    slug: "hot-stone",
    label: "Hot Stone Massage",
    title: "Hot Stone Massage Therapists | MasseurMatch",
    h1: "Hot Stone Massage Therapists",
    description:
      "Discover hot stone massage therapists using heated stones for deep relaxation. Find verified therapists offering this therapeutic technique across the US.",
    intro:
      "Hot stone massage uses heated smooth stones placed on the body to promote deep relaxation and muscle tension relief. Find MasseurMatch therapists trained in this soothing technique.",
    primaryKeyword: "hot stone massage",
    longTailKeywords: [
      "hot stone massage near me",
      "hot stone massage therapy",
      "heated stone massage",
      "hot stone relaxation massage",
      "therapeutic hot stone massage",
    ],
    faqs: [
      {
        question: "What is hot stone massage?",
        answer:
          "Hot stone massage uses smooth, heated stones placed on the body and used as massage tools. The warmth promotes deep relaxation and helps muscles release tension.",
      },
      {
        question: "Is hot stone massage safe?",
        answer:
          "Yes, hot stone massage is safe when performed by a trained therapist. They monitor temperature carefully to ensure comfort and prevent burns.",
      },
      {
        question: "What are the benefits of hot stone massage?",
        answer:
          "Benefits include deep relaxation, muscle tension relief, improved circulation, stress reduction, and improved sleep. The warmth is particularly soothing and therapeutic.",
      },
      {
        question: "Who should avoid hot stone massage?",
        answer:
          "People with certain conditions (severe sunburn, varicose veins, nerve damage) may want to avoid hot stone massage. Always discuss health conditions with your therapist beforehand.",
      },
    ],
  },
};

export function getServiceMetadata(slug: string): ServiceMetadata | null {
  const service = SERVICE_METADATA[slug as ServiceSlug];
  return service || null;
}

export function getAllServices(): ServiceMetadata[] {
  return NATIONAL_SERVICE_SLUGS.map((slug) => SERVICE_METADATA[slug]);
}
