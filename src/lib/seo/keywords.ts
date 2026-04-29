export const KEYWORD_CLUSTERS = {
  lgbtFriendlyCommercial: [
    "gay massage",
    "gay massage near me",
    "gay massage therapist",
    "gay friendly massage",
    "LGBT friendly massage",
    "LGBT massage therapist",
    "LGBTQ friendly massage therapist",
    "gay friendly massage therapist near me",
  ],
  maleMassageIntent: [
    "male massage",
    "male massage near me",
    "male massage therapist",
    "male massage therapist near me",
    "male masseur",
    "male masseur near me",
    "professional male massage therapist",
  ],
  localMassageIntent: [
    "massage near me",
    "massage therapist near me",
    "massage in [city]",
    "massage therapist in [city]",
    "professional massage in [city]",
    "independent massage therapist in [city]",
    "private massage therapist in [city]",
  ],
  modalityIntent: [
    "deep tissue massage in [city]",
    "Swedish massage in [city]",
    "sports massage in [city]",
    "therapeutic massage in [city]",
    "relaxation massage in [city]",
    "mobile massage in [city]",
    "incall massage in [city]",
    "outcall massage in [city]",
  ],
  profileIntent: [
    "massage therapist profile",
    "independent massage provider",
    "massage therapist contact",
    "professional massage profile",
    "find massage therapists",
    "compare massage therapists",
  ],
} as const;

export const UNSAFE_KEYWORDS = ["gayxxx massage", "escort", "erotic", "sexual", "adult service"];
export const COMPETITOR_TERMS = ["masseurfinder", "rent masseur", "massuer finder.com"];
