export type WireframeStateId = "logged-out" | "logged-in";
export type WireframeViewportId = "desktop" | "tablet" | "mobile";
export type WireframeTone = "surface" | "accent" | "support" | "success" | "warning" | "ghost";
export type WireframeHeight = "xs" | "sm" | "md" | "lg" | "xl";
export type PrototypeStepId = "home" | "explore" | "profile" | "join" | "dashboard";

export type WireframeBlock = {
  label: string;
  span: number;
  height: WireframeHeight;
  tone?: WireframeTone;
  note?: string;
  interactive?: boolean;
};

export type WireframeBand = {
  label: string;
  columns: number;
  blocks: WireframeBlock[];
};

export type WireframeLayout = {
  note: string;
  bands: WireframeBand[];
};

export type ScreenStateSpec = {
  id: WireframeStateId;
  label: string;
  summary: string;
  navigation: string;
  primaryAction: string;
  accessPattern: string;
  knottyBehavior: string;
  canvasNote: string;
};

export type WireframeScreenSpec = {
  id: string;
  title: string;
  route: string;
  description: string;
  goal: string;
  structure: string[];
  spacingRules: string[];
  alignmentRules: string[];
  states: ScreenStateSpec[];
  layouts: Record<WireframeViewportId, WireframeLayout>;
};

export type ComponentInventoryItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  tailwindReference: string;
  states: Array<{
    name: string;
    tailwind: string;
    note: string;
  }>;
  preview: "buttons" | "pills" | "profile-card" | "forms" | "chat";
};

export type ContrastPair = {
  label: string;
  foreground: string;
  background: string;
  ratio: string;
  usage: string;
};

export type PrototypePrompt = {
  label: string;
  response: string;
  target?: PrototypeStepId;
};

export type PrototypeStep = {
  id: PrototypeStepId;
  title: string;
  route: string;
  goal: string;
  primaryAction: string;
  hotspotHint: string;
  prompts: PrototypePrompt[];
};

export const VIEWPORTS: Record<
  WireframeViewportId,
  { label: string; frame: string; description: string }
> = {
  desktop: {
    label: "Desktop",
    frame: "1440px / 12-column grid",
    description: "Wide comparison surfaces, persistent utility rails, and multi-column density.",
  },
  tablet: {
    label: "Tablet",
    frame: "834px / 8-column grid",
    description: "Stacked hero patterns, compressed side rails, and two-column cards.",
  },
  mobile: {
    label: "Mobile",
    frame: "390px / 4-column grid",
    description: "Single-column flows, sticky CTAs, bottom sheets, and thumb-friendly spacing.",
  },
};

export const PROTOTYPE_SEQUENCE: PrototypeStepId[] = ["home", "explore", "profile", "join", "dashboard"];

export const PROTOTYPE_FLOW: PrototypeStep[] = [
  {
    id: "home",
    title: "Home",
    route: "/",
    goal: "Orient a new visitor, establish trust, and route them into exploration quickly.",
    primaryAction: "Explore therapists",
    hotspotHint: "Primary CTA opens explore; profile spotlight can jump to profile detail.",
    prompts: [
      {
        label: "Find available-now therapists",
        response: "Knotty narrows the directory and routes the visitor into explore with availability-first results.",
        target: "explore",
      },
      {
        label: "Show verified profiles near Dallas",
        response: "Knotty recommends a verified-first result set and highlights the explore filter stack.",
        target: "explore",
      },
      {
        label: "How does the provider side work?",
        response: "Knotty points to the join funnel and explains that dashboard access unlocks after account creation.",
        target: "join",
      },
    ],
  },
  {
    id: "explore",
    title: "Explore",
    route: "/search",
    goal: "Help users refine the directory with clear filters, shortlist behavior, and trust-first sorting.",
    primaryAction: "Open profile",
    hotspotHint: "Selecting the top card advances into the profile review step.",
    prompts: [
      {
        label: "Compare outcall and incall",
        response: "Knotty explains the filter chips and highlights the comparison rail beside the result cards.",
      },
      {
        label: "Save this search for later",
        response: "Knotty nudges logged-out visitors toward sign-in and shows logged-in visitors where saved searches live.",
      },
      {
        label: "Take me to the best matching profile",
        response: "Knotty recommends the first high-trust card and advances to the profile details screen.",
        target: "profile",
      },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    route: "/therapists/[slug]",
    goal: "Let visitors validate trust, compare services, and decide whether to contact or join as a provider.",
    primaryAction: "Review provider flow",
    hotspotHint: "The provider CTA from the trust rail advances into join.",
    prompts: [
      {
        label: "Explain the verification badges",
        response: "Knotty breaks down identity, photo, and profile review badges in plain language.",
      },
      {
        label: "What should I ask before booking?",
        response: "Knotty suggests pricing, location, boundaries, and availability questions without leaving the page.",
      },
      {
        label: "I am a therapist, how do I get listed?",
        response: "Knotty opens the therapist join funnel and preps the user for account setup.",
        target: "join",
      },
    ],
  },
  {
    id: "join",
    title: "Join",
    route: "/pro/join",
    goal: "Convert providers with a short setup funnel, clear plan language, and visible accessibility support.",
    primaryAction: "Create account",
    hotspotHint: "Submitting the join form advances into the dashboard.",
    prompts: [
      {
        label: "Compare Standard, Pro, and Elite",
        response: "Knotty summarizes plan differences and points to the pricing cards without overwhelming the form.",
      },
      {
        label: "How long will setup take?",
        response: "Knotty answers with a three-step outline and reassures the user that the dashboard finishes the profile.",
      },
      {
        label: "Continue to dashboard",
        response: "Knotty confirms account creation and launches the logged-in dashboard state.",
        target: "dashboard",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    route: "/pro/dashboard",
    goal: "Help providers manage profile completeness, performance, support, and billing with minimal friction.",
    primaryAction: "Back to home",
    hotspotHint: "The dashboard is the completion state in the core prototype flow.",
    prompts: [
      {
        label: "What should I finish first?",
        response: "Knotty prioritizes profile completeness, photos, pricing, and FAQ setup in that order.",
      },
      {
        label: "How do I improve conversion?",
        response: "Knotty recommends tighter headlines, availability updates, and clearer verification badges.",
      },
      {
        label: "Restart the public flow",
        response: "Knotty can take the tester back to the homepage to run another user-testing session.",
        target: "home",
      },
    ],
  },
];

export const ACCESSIBILITY_CHECKLIST = [
  {
    title: "WCAG 2.2 AA baseline",
    items: [
      "Color tokens avoid low-contrast accent-on-white text and reserve bright accent fills for decoration or dark-on-light pairings.",
      "Every actionable element uses a 3:1 minimum visible focus ring with 4px outline offset in the prototype and exported stylesheet.",
      "All wireframe controls are keyboard-reachable with semantic button, link, nav, main, section, and complementary landmarks.",
    ],
  },
  {
    title: "Navigation and assistive tech",
    items: [
      "Skip links jump directly to the wireframe content and prototype canvas.",
      "State toggles use `aria-pressed`; the flow stepper uses `aria-current`; chat updates are announced through `aria-live`.",
      "Admin, legal, and dashboard screens include explicit labels for sidebars, breadcrumb zones, and table/group containers.",
    ],
  },
  {
    title: "Readable typography",
    items: [
      "Type scale is rem-based so browser zoom and OS text scaling work without truncating cards or controls.",
      "Body copy stays at 16px or larger, with 1.5 plus line-height in content areas and 44px minimum tap targets on touch layouts.",
      "Responsive wireframes preserve left alignment for long-form text while centering only short hero statements and utility pills.",
    ],
  },
];

export const CONTRAST_PAIRS: ContrastPair[] = [
  {
    label: "Primary text on canvas",
    foreground: "#102A43",
    background: "#F7F4EE",
    ratio: "13.34:1",
    usage: "Default headings, body copy, and legal content blocks.",
  },
  {
    label: "Secondary button text",
    foreground: "#102A43",
    background: "#E4ECF7",
    ratio: "12.30:1",
    usage: "Secondary CTA, filter chips, and neutral utility actions.",
  },
  {
    label: "Primary button text",
    foreground: "#FFFFFF",
    background: "#12325B",
    ratio: "12.86:1",
    usage: "High-priority actions, flow advancement, and dashboard submit buttons.",
  },
  {
    label: "Available now pill",
    foreground: "#1F5C4D",
    background: "#EAF8EF",
    ratio: "7.11:1",
    usage: "Availability status chips and success messaging.",
  },
  {
    label: "Visiting soon pill",
    foreground: "#7A2E0B",
    background: "#FFF1E8",
    ratio: "8.55:1",
    usage: "Travel date pills and warning-state metadata.",
  },
  {
    label: "Focus ring on canvas",
    foreground: "#0F62FE",
    background: "#F7F4EE",
    ratio: "4.56:1",
    usage: "Focus outline, keyboard callout ring, and skip-link highlight.",
  },
];

export const FIGMA_HANDOFF = [
  "Create a Figma page named `MasseurMatch Wireframes` with sections: Screens, Prototype Flow, Components, Accessibility Tokens, Export Notes.",
  "Use frame names `WF / {Screen} / {Viewport}` for wireframes and `PROTO / {Step}` for the interactive test flow.",
  "Apply Auto Layout with 24px desktop, 20px tablet, and 16px mobile internal padding; use 32px, 24px, and 16px gaps respectively.",
  "Map exported CSS custom properties to Figma variables under collections `Color`, `Spacing`, `Radius`, `Motion`, and `Focus`.",
  "Attach interaction notes to the prototype stepper and Knotty prompt chips so user-test observers can trace intended click paths.",
];

export const EXPORT_ASSETS = [
  {
    title: "Accessible stylesheet export",
    path: "/exports/masseurmatch-wireframes-accessibility.css",
  },
  {
    title: "Figma handoff guide",
    path: "docs/masseurmatch-wireframe-handoff.md",
  },
];

export const COMPONENT_INVENTORY: ComponentInventoryItem[] = [
  {
    id: "buttons",
    title: "Buttons",
    category: "Primary, secondary, ghost",
    description:
      "Action buttons use high-contrast color pairs, 44px minimum touch height, and motion that reduces gracefully under `prefers-reduced-motion`.",
    tailwindReference:
      "inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0F62FE] disabled:pointer-events-none disabled:opacity-50",
    states: [
      {
        name: "Primary",
        tailwind:
          "bg-[#12325B] text-white hover:-translate-y-0.5 hover:bg-[#0D2545] active:translate-y-0 active:bg-[#0B2340] disabled:bg-[#7A8CA6]",
        note: "Use for the single highest-priority action per panel.",
      },
      {
        name: "Secondary",
        tailwind:
          "bg-[#E4ECF7] text-[#102A43] hover:bg-[#D7E4F3] active:bg-[#CDDEEF] disabled:bg-[#EEF3F8] disabled:text-[#5F738C]",
        note: "Use for alternate paths and safe secondary commits.",
      },
      {
        name: "Ghost",
        tailwind:
          "border border-[#B6C2D2] bg-transparent text-[#102A43] hover:bg-[#EEF2F6] active:bg-[#E5EBF1] disabled:border-[#D7DEE7] disabled:text-[#73859A]",
        note: "Use for low-emphasis actions, inline utilities, or dismiss behavior.",
      },
    ],
    preview: "buttons",
  },
  {
    id: "pills",
    title: "Pills",
    category: "Availability and freshness",
    description:
      "Status pills prioritize icon plus text, not color alone, so availability and travel context stay accessible for color-blind users.",
    tailwindReference:
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.08em]",
    states: [
      {
        name: "Available Now",
        tailwind: "border-[#76A58F] bg-[#EAF8EF] text-[#1F5C4D]",
        note: "Pairs with a live-dot or check icon for non-color confirmation.",
      },
      {
        name: "Visiting Soon",
        tailwind: "border-[#D97B42] bg-[#FFF1E8] text-[#7A2E0B]",
        note: "Travel dates should be announced in text, not only iconography.",
      },
      {
        name: "New Profile",
        tailwind: "border-[#6C90D2] bg-[#EAF2FF] text-[#1E3E70]",
        note: "Use to signal freshness and onboarding momentum.",
      },
    ],
    preview: "pills",
  },
  {
    id: "profile-card",
    title: "3D Profile Cards",
    category: "Directory surface",
    description:
      "The card uses layered shadows, subtle tilt, and dense trust metadata while keeping all profile actions inside a predictable reading order.",
    tailwindReference:
      "rounded-[28px] border border-[#D6D0C4] bg-[#FFFDF8] p-5 shadow-[0_18px_40px_rgba(16,42,67,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(16,42,67,0.18)] focus-within:outline focus-within:outline-4 focus-within:outline-offset-4 focus-within:outline-[#0F62FE]",
    states: [
      {
        name: "Hover",
        tailwind: "hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(16,42,67,0.18)]",
        note: "Movement is shallow enough to avoid distraction in dense grids.",
      },
      {
        name: "Active",
        tailwind: "active:translate-y-0 active:shadow-[0_14px_28px_rgba(16,42,67,0.16)]",
        note: "Press state compresses depth instead of changing color only.",
      },
      {
        name: "Disabled / hidden",
        tailwind: "opacity-60 grayscale-[0.08] pointer-events-none",
        note: "Use only for unavailable promoted slots, not regular directory results.",
      },
    ],
    preview: "profile-card",
  },
  {
    id: "forms",
    title: "Inputs, Dropdowns, and Modals",
    category: "Form system",
    description:
      "Inputs, selects, and modals share the same focus model, accessible helper text zone, and field-error pattern across join, dashboard, and admin.",
    tailwindReference:
      "w-full rounded-2xl border border-[#B6C2D2] bg-white px-4 py-3 text-sm text-[#102A43] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] placeholder:text-[#61758A] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0F62FE]",
    states: [
      {
        name: "Default",
        tailwind: "border-[#B6C2D2] bg-white text-[#102A43]",
        note: "Helper text sits directly below the control and stays connected via `aria-describedby`.",
      },
      {
        name: "Hover",
        tailwind: "hover:border-[#7F95AE]",
        note: "Border-only hover avoids accidental meaning shifts for form fields.",
      },
      {
        name: "Error",
        tailwind: "border-[#C9534C] bg-[#FFF6F5] text-[#8C1D18] focus-visible:outline-[#C9534C]",
        note: "Error text is paired with icon and inline copy, not color alone.",
      },
      {
        name: "Disabled",
        tailwind: "cursor-not-allowed border-[#D7DEE7] bg-[#F4F6F8] text-[#73859A]",
        note: "Disabled fields keep 4.5:1 text contrast for visible context.",
      },
    ],
    preview: "forms",
  },
  {
    id: "chat",
    title: "Chat Interface",
    category: "Knotty AI",
    description:
      "Knotty uses a split header, prompt chip rail, transcript region, and fixed composer so testers can review responses without losing context.",
    tailwindReference:
      "flex h-[560px] flex-col overflow-hidden rounded-[28px] border border-[#D6D0C4] bg-[#FFFDF8] shadow-[0_20px_48px_rgba(16,42,67,0.14)]",
    states: [
      {
        name: "Hover / prompt",
        tailwind: "hover:bg-[#EEF2F6] hover:text-[#102A43]",
        note: "Prompt chips use 44px targets and always remain keyboard actionable.",
      },
      {
        name: "Active / sending",
        tailwind: "data-[state=sending]:opacity-70 data-[state=sending]:animate-pulse",
        note: "Pair visual typing state with live-region updates.",
      },
      {
        name: "Disabled / offline",
        tailwind: "opacity-60 pointer-events-none",
        note: "Expose connection issues in text and keep transcript readable.",
      },
    ],
    preview: "chat",
  },
];

export const SCREENS: WireframeScreenSpec[] = [
  {
    id: "homepage",
    title: "Homepage",
    route: "/",
    description:
      "Public trust-building entry point that immediately balances discovery, proof, and next-step routing.",
    goal: "Move visitors from orientation into search without hiding trust cues or provider pathways.",
    structure: [
      "Sticky header with skip navigation, utility links, language control, auth cluster, and primary search CTA.",
      "Hero split between editorial trust copy, search/start actions, and a featured 3D profile plus Knotty teaser.",
      "Trust bar, category shortcuts, featured therapist cards, city coverage, and a closing CTA band.",
    ],
    spacingRules: [
      "Desktop sections use 56px to 80px vertical rhythm with 32px internal card gaps; tablet drops to 40px and mobile to 24px.",
      "Hero copy blocks maintain 24px spacing between eyebrow, headline, body, CTA row, and micro-proof line.",
      "Cards keep 20px padding on desktop, 18px on tablet, and 16px on mobile with no text block tighter than 12px.",
    ],
    alignmentRules: [
      "Desktop hero is left-aligned on the copy side and top-aligned to the featured card so eye movement stays horizontal.",
      "Trust and city cards align on the first text baseline within each row to avoid a noisy masonry effect.",
      "Mobile centers the short eyebrow and CTA clusters, but long-form body copy remains left-aligned for readability.",
    ],
    states: [
      {
        id: "logged-out",
        label: "Logged out",
        summary: "Emphasizes trust, discovery, and therapist onboarding with guest-safe entry points.",
        navigation: "Header shows Login and Join alongside the main search CTA.",
        primaryAction: "Primary CTA says `Explore therapists`; secondary CTA says `Join as a therapist`.",
        accessPattern: "Saved searches and shortlist modules are replaced with proof panels and guest education.",
        knottyBehavior: "Knotty prompts steer visitors into explore or the join funnel.",
        canvasNote: "Guest state highlights the trust-first search entry and provider recruitment CTA.",
      },
      {
        id: "logged-in",
        label: "Logged in",
        summary: "Swaps acquisition messaging for continuity: saved searches, recent activity, and dashboard shortcuts.",
        navigation: "Header replaces Login/Join with avatar menu, shortlist, and dashboard access.",
        primaryAction: "Primary CTA becomes `Continue searching`; secondary CTA becomes `Open dashboard`.",
        accessPattern: "Hero utility band surfaces last city viewed, saved filters, and recent Knotty prompts.",
        knottyBehavior: "Knotty suggests resuming the prior workflow instead of onboarding copy.",
        canvasNote: "Member state surfaces continuity widgets and shortcuts in the top utility band.",
      },
    ],
    layouts: {
      desktop: {
        note: "12-column split hero with high-density shortcuts below the fold.",
        bands: [
          {
            label: "Header",
            columns: 12,
            blocks: [
              { label: "Skip link / wordmark / primary nav", span: 8, height: "sm", tone: "ghost" },
              { label: "Locale / auth / search CTA", span: 4, height: "sm", tone: "surface" },
            ],
          },
          {
            label: "Hero",
            columns: 12,
            blocks: [
              { label: "Trust copy / search module / CTA row", span: 7, height: "xl", tone: "accent", interactive: true },
              { label: "Featured 3D card / Knotty teaser", span: 5, height: "xl", tone: "surface", interactive: true },
            ],
          },
          {
            label: "Trust bar",
            columns: 4,
            blocks: [
              { label: "Verification", span: 1, height: "sm", tone: "support" },
              { label: "Reviews", span: 1, height: "sm", tone: "support" },
              { label: "Direct contact", span: 1, height: "sm", tone: "support" },
              { label: "Respectful boundaries", span: 1, height: "sm", tone: "support" },
            ],
          },
          {
            label: "Browse shortcuts",
            columns: 4,
            blocks: [
              { label: "Specialty cards", span: 1, height: "md", tone: "surface" },
              { label: "Specialty cards", span: 1, height: "md", tone: "surface" },
              { label: "Specialty cards", span: 1, height: "md", tone: "surface" },
              { label: "Specialty cards", span: 1, height: "md", tone: "surface" },
            ],
          },
          {
            label: "Featured profiles",
            columns: 3,
            blocks: [
              { label: "3D profile card", span: 1, height: "lg", tone: "surface", interactive: true },
              { label: "3D profile card", span: 1, height: "lg", tone: "surface" },
              { label: "3D profile card", span: 1, height: "lg", tone: "surface" },
            ],
          },
          {
            label: "City coverage / closing CTA",
            columns: 2,
            blocks: [
              { label: "City coverage cards", span: 1, height: "lg", tone: "support" },
              { label: "Final CTA panel", span: 1, height: "lg", tone: "accent" },
            ],
          },
        ],
      },
      tablet: {
        note: "Hero stacks into two rows; supporting cards shift to a two-column rhythm.",
        bands: [
          {
            label: "Header",
            columns: 8,
            blocks: [
              { label: "Wordmark / nav", span: 5, height: "sm", tone: "ghost" },
              { label: "Auth / menu / search CTA", span: 3, height: "sm", tone: "surface" },
            ],
          },
          {
            label: "Hero",
            columns: 8,
            blocks: [
              { label: "Trust copy / CTA row", span: 8, height: "lg", tone: "accent", interactive: true },
              { label: "Search module / featured card / Knotty", span: 8, height: "lg", tone: "surface", interactive: true },
            ],
          },
          {
            label: "Trust bar",
            columns: 2,
            blocks: [
              { label: "Trust chip stack", span: 1, height: "md", tone: "support" },
              { label: "Trust chip stack", span: 1, height: "md", tone: "support" },
            ],
          },
          {
            label: "Shortcuts",
            columns: 2,
            blocks: [
              { label: "Specialties", span: 1, height: "md", tone: "surface" },
              { label: "Specialties", span: 1, height: "md", tone: "surface" },
              { label: "Featured cards", span: 1, height: "lg", tone: "surface" },
              { label: "City cards", span: 1, height: "lg", tone: "support" },
            ],
          },
          {
            label: "CTA",
            columns: 1,
            blocks: [{ label: "Closing CTA", span: 1, height: "md", tone: "accent" }],
          },
        ],
      },
      mobile: {
        note: "Single-column trust-first funnel with sticky navigation affordances.",
        bands: [
          {
            label: "Header",
            columns: 4,
            blocks: [
              { label: "Wordmark / menu", span: 2, height: "sm", tone: "ghost" },
              { label: "Search CTA / auth", span: 2, height: "sm", tone: "surface" },
            ],
          },
          {
            label: "Hero stack",
            columns: 1,
            blocks: [
              { label: "Trust copy / CTA", span: 1, height: "lg", tone: "accent", interactive: true },
              { label: "Search box", span: 1, height: "sm", tone: "surface", interactive: true },
              { label: "Featured card / Knotty", span: 1, height: "lg", tone: "surface", interactive: true },
            ],
          },
          {
            label: "Trust",
            columns: 1,
            blocks: [{ label: "Trust proof stack", span: 1, height: "md", tone: "support" }],
          },
          {
            label: "Browse",
            columns: 1,
            blocks: [
              { label: "Specialty cards carousel", span: 1, height: "md", tone: "surface" },
              { label: "Featured profile card", span: 1, height: "lg", tone: "surface" },
              { label: "City list", span: 1, height: "md", tone: "support" },
            ],
          },
          {
            label: "Final CTA",
            columns: 1,
            blocks: [{ label: "Sticky CTA band", span: 1, height: "sm", tone: "accent" }],
          },
        ],
      },
    },
  },
  {
    id: "explore",
    title: "Explore",
    route: "/search",
    description:
      "Filter-heavy discovery view built for direct comparison, shortlist behavior, and quick confidence checks.",
    goal: "Reduce decision time by keeping filters, results, trust badges, and Knotty help visible together.",
    structure: [
      "Search summary header with active filters, saved-search affordance, and shortcut links back to cities and categories.",
      "Filter rail with modality, price, availability, tier, and travel chips paired with a high-trust result grid.",
      "Support row for FAQ, compare tools, map/context rails, and Knotty nudges toward the next profile.",
    ],
    spacingRules: [
      "Filter groups use 16px vertical spacing; result cards use 20px padding and 24px between rows on desktop.",
      "Tablet collapses the filter rail into a top sheet and keeps 20px gaps between results and supporting cards.",
      "Mobile keeps all filter controls at least 44px tall and uses sticky bottom CTAs for save and clear actions.",
    ],
    alignmentRules: [
      "Desktop aligns filter labels to the top left and keeps result card media, title, and CTA rows vertically ordered.",
      "Tablet keeps filters full width above results before switching to a two-column card grid.",
      "Mobile results are single-column with left-aligned metadata and a persistent CTA row anchored to the viewport bottom.",
    ],
    states: [
      {
        id: "logged-out",
        label: "Logged out",
        summary: "Focuses on confidence, filtering, and soft conversion into sign-in when users try to save or compare.",
        navigation: "Header uses Login and Join prompts instead of shortlist and dashboard links.",
        primaryAction: "Result cards favor `Open profile`; save-search actions trigger a sign-in prompt.",
        accessPattern: "Shortlist, compare, and saved city tools are read-only teasers until authentication.",
        knottyBehavior: "Knotty suggests filters and explains trust signals without requiring account context.",
        canvasNote: "Guest explore keeps result actions open while gating persistence features.",
      },
      {
        id: "logged-in",
        label: "Logged in",
        summary: "Adds persistence: shortlist, save search, compare, and resume recent contact history.",
        navigation: "Header includes shortlist count, avatar menu, and a direct dashboard shortcut.",
        primaryAction: "Primary actions become `Save search`, `Compare`, and `Message later` alongside profile open.",
        accessPattern: "A personalized rail shows recent cities, saved filters, and recommended therapist cards.",
        knottyBehavior: "Knotty can reference recent searches and suggest dashboard actions if the user is a provider.",
        canvasNote: "Member explore surfaces saved state and shortlist behavior beside the result grid.",
      },
    ],
    layouts: {
      desktop: {
        note: "Left filter rail, center result grid, and right support context for denser evaluation.",
        bands: [
          {
            label: "Summary header",
            columns: 12,
            blocks: [
              { label: "Search summary / breadcrumbs", span: 8, height: "md", tone: "ghost" },
              { label: "Save search / compare / Knotty trigger", span: 4, height: "md", tone: "surface" },
            ],
          },
          {
            label: "Filters and results",
            columns: 12,
            blocks: [
              { label: "Filter rail", span: 3, height: "xl", tone: "support", interactive: true },
              { label: "Results grid", span: 9, height: "xl", tone: "surface", interactive: true },
            ],
          },
          {
            label: "Secondary support",
            columns: 12,
            blocks: [
              { label: "Shortlist / compare rail", span: 4, height: "lg", tone: "support" },
              { label: "Map or editorial context", span: 4, height: "lg", tone: "surface" },
              { label: "Knotty helper / FAQ", span: 4, height: "lg", tone: "accent" },
            ],
          },
        ],
      },
      tablet: {
        note: "Filters move to the top; results, shortlist, and help settle into a balanced two-column rhythm.",
        bands: [
          {
            label: "Header",
            columns: 8,
            blocks: [
              { label: "Search summary", span: 5, height: "md", tone: "ghost" },
              { label: "Save / compare", span: 3, height: "md", tone: "surface" },
            ],
          },
          {
            label: "Filters",
            columns: 1,
            blocks: [{ label: "Filter accordion / chips", span: 1, height: "md", tone: "support", interactive: true }],
          },
          {
            label: "Results",
            columns: 2,
            blocks: [
              { label: "Result card", span: 1, height: "lg", tone: "surface", interactive: true },
              { label: "Result card", span: 1, height: "lg", tone: "surface" },
              { label: "Shortlist or FAQ", span: 1, height: "md", tone: "support" },
              { label: "Knotty rail", span: 1, height: "md", tone: "accent" },
            ],
          },
        ],
      },
      mobile: {
        note: "Sticky filter and save controls anchor the experience while results stay single-column.",
        bands: [
          {
            label: "Summary",
            columns: 1,
            blocks: [
              { label: "Search summary / active chips", span: 1, height: "md", tone: "ghost" },
              { label: "Sticky filter + save row", span: 1, height: "sm", tone: "surface", interactive: true },
            ],
          },
          {
            label: "Results",
            columns: 1,
            blocks: [
              { label: "Result card", span: 1, height: "lg", tone: "surface", interactive: true },
              { label: "Result card", span: 1, height: "lg", tone: "surface" },
              { label: "Result card", span: 1, height: "lg", tone: "surface" },
            ],
          },
          {
            label: "Support",
            columns: 1,
            blocks: [
              { label: "Knotty helper", span: 1, height: "md", tone: "accent" },
              { label: "FAQ / compare", span: 1, height: "md", tone: "support" },
            ],
          },
        ],
      },
    },
  },
];

export function getPrototypeStep(stepId: PrototypeStepId) {
  return PROTOTYPE_FLOW.find((step) => step.id === stepId) ?? PROTOTYPE_FLOW[0];
}

export function getScreen(screenId: string) {
  return SCREENS.find((screen) => screen.id === screenId);
}
