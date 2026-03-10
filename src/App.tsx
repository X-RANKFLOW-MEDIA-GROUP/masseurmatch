import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { KnottyChat } from "@/components/ai/KnottyChat";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// ── Lazy-loaded route components ──
const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TherapistProfile = lazy(() => import("./pages/TherapistProfile"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const Safety = lazy(() => import("./pages/Safety"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const City = lazy(() => import("./pages/City"));
const CityListing = lazy(() => import("./pages/CityListing"));
const CityDirectory = lazy(() => import("./pages/CityDirectory"));
const ClaimProfile = lazy(() => import("./pages/ClaimProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Legal pages
const TherapistAgreement = lazy(() => import("./pages/legal/TherapistAgreement"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const BillingPolicy = lazy(() => import("./pages/legal/BillingPolicy"));
const AcceptableUse = lazy(() => import("./pages/legal/AcceptableUse"));
const PhotoPolicy = lazy(() => import("./pages/legal/PhotoPolicy"));
const DMCA = lazy(() => import("./pages/legal/DMCA"));
const Accessibility = lazy(() => import("./pages/legal/Accessibility"));
const MarketingConsent = lazy(() => import("./pages/legal/MarketingConsent"));
const NoticeAtCollection = lazy(() => import("./pages/legal/NoticeAtCollection"));
const GoverningLaw = lazy(() => import("./pages/legal/GoverningLaw"));
const LegalContact = lazy(() => import("./pages/legal/LegalContact"));

// Dashboard
const DashboardLayout = lazy(() => import("@/components/dashboard/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const DashboardProfile = lazy(() => import("./pages/dashboard/DashboardProfile"));
const DashboardPhotos = lazy(() => import("./pages/dashboard/DashboardPhotos"));
const DashboardLocation = lazy(() => import("./pages/dashboard/DashboardLocation"));
const DashboardPricing = lazy(() => import("./pages/dashboard/DashboardPricing"));
const DashboardAvailability = lazy(() => import("./pages/dashboard/DashboardAvailability"));
const DashboardVerification = lazy(() => import("./pages/dashboard/DashboardVerification"));
const DashboardSubscription = lazy(() => import("./pages/dashboard/DashboardSubscription"));
const DashboardSettings = lazy(() => import("./pages/dashboard/DashboardSettings"));
const DashboardSeo = lazy(() => import("./pages/dashboard/DashboardSeo"));
const DashboardPromotion = lazy(() => import("./pages/dashboard/DashboardPromotion"));
const DashboardFAQ = lazy(() => import("./pages/dashboard/DashboardFAQ"));
const DashboardTravel = lazy(() => import("./pages/dashboard/DashboardTravel"));
const DashboardSupport = lazy(() => import("./pages/dashboard/DashboardSupport"));
const DashboardSpecials = lazy(() => import("./pages/dashboard/DashboardSpecials"));
const DashboardDemandRadar = lazy(() => import("./pages/dashboard/DashboardDemandRadar"));

// Admin
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminMailbox = lazy(() => import("./pages/admin/AdminMailbox"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
const AdminAIPrecheck = lazy(() => import("./pages/admin/AdminAIPrecheck"));
const AdminFlags = lazy(() => import("./pages/admin/AdminFlags"));
const AdminFeatured = lazy(() => import("./pages/admin/AdminFeatured"));
const AdminCityOps = lazy(() => import("./pages/admin/AdminCityOps"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

/** Redirect /city/:slug → /:slug (the new city landing page) */
const LegacyCityRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug}`} replace />;
};

/** Redirect /therapist/:id → attempts to build SEO URL, falls back to rendering */
const LegacyTherapistRedirect = () => {
  return (
    <PageTransition>
      <Suspense fallback={<Loading />}>
        <TherapistProfile />
      </Suspense>
    </PageTransition>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loading />}>
        <Routes location={location} key={location.pathname}>
          {/* ── Static routes ── */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
          <Route path="/cities" element={<PageTransition><CityDirectory /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQPage /></PageTransition>} />
          <Route path="/safety" element={<PageTransition><Safety /></PageTransition>} />

          {/* ── Legal pages ── */}
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/therapist-agreement" element={<PageTransition><TherapistAgreement /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
          <Route path="/billing-policy" element={<PageTransition><BillingPolicy /></PageTransition>} />
          <Route path="/acceptable-use" element={<PageTransition><AcceptableUse /></PageTransition>} />
          <Route path="/photo-policy" element={<PageTransition><PhotoPolicy /></PageTransition>} />
          <Route path="/dmca" element={<PageTransition><DMCA /></PageTransition>} />
          <Route path="/accessibility" element={<PageTransition><Accessibility /></PageTransition>} />
          <Route path="/marketing-consent" element={<PageTransition><MarketingConsent /></PageTransition>} />
          <Route path="/notice-at-collection" element={<PageTransition><NoticeAtCollection /></PageTransition>} />
          <Route path="/governing-law" element={<PageTransition><GoverningLaw /></PageTransition>} />
          <Route path="/legal-contact" element={<PageTransition><LegalContact /></PageTransition>} />

          <Route path="/claim/:slug" element={<PageTransition><ClaimProfile /></PageTransition>} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<DashboardProfile />} />
            <Route path="photos" element={<DashboardPhotos />} />
            <Route path="location" element={<DashboardLocation />} />
            <Route path="pricing" element={<DashboardPricing />} />
            <Route path="availability" element={<DashboardAvailability />} />
            <Route path="verification" element={<DashboardVerification />} />
            <Route path="subscription" element={<DashboardSubscription />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="seo" element={<DashboardSeo />} />
            <Route path="promotion" element={<DashboardPromotion />} />
            <Route path="faq" element={<DashboardFAQ />} />
            <Route path="travel" element={<DashboardTravel />} />
            <Route path="specials" element={<DashboardSpecials />} />
            <Route path="support" element={<DashboardSupport />} />
            <Route path="demand-radar" element={<DashboardDemandRadar />} />
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="mailbox" element={<AdminMailbox />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="ai-precheck" element={<AdminAIPrecheck />} />
            <Route path="flags" element={<AdminFlags />} />
            <Route path="featured" element={<AdminFeatured />} />
            <Route path="city-ops" element={<AdminCityOps />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
          </Route>

          {/* ── Legacy redirects ── */}
          <Route path="/city/:slug" element={<LegacyCityRedirect />} />
          <Route path="/therapist/:id" element={<LegacyTherapistRedirect />} />

          {/* ── SEO-friendly dynamic routes ── */}
          <Route path="/:city/massage-therapists" element={<PageTransition><CityListing /></PageTransition>} />
          <Route path="/:city/therapist/:slug" element={<PageTransition><TherapistProfile /></PageTransition>} />
          <Route path="/:city" element={<PageTransition><City /></PageTransition>} />

          {/* ── 404 ── */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
          <KnottyChat />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
