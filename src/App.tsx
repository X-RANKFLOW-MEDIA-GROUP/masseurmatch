import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { KnottyChat } from "@/components/ai/KnottyChat";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import TherapistProfile from "./pages/TherapistProfile";
import FAQPage from "./pages/FAQ";
import Safety from "./pages/Safety";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import City from "./pages/City";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardPhotos from "./pages/dashboard/DashboardPhotos";
import DashboardLocation from "./pages/dashboard/DashboardLocation";
import DashboardPricing from "./pages/dashboard/DashboardPricing";
import DashboardAvailability from "./pages/dashboard/DashboardAvailability";
import DashboardVerification from "./pages/dashboard/DashboardVerification";
import DashboardSubscription from "./pages/dashboard/DashboardSubscription";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardSeo from "./pages/dashboard/DashboardSeo";
import DashboardPromotion from "./pages/dashboard/DashboardPromotion";
import DashboardFAQ from "./pages/dashboard/DashboardFAQ";
import DashboardTravel from "./pages/dashboard/DashboardTravel";

// Admin
import AdminLogin from "./pages/AdminLogin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminMailbox from "./pages/admin/AdminMailbox";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminAIPrecheck from "./pages/admin/AdminAIPrecheck";
import AdminFlags from "./pages/admin/AdminFlags";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminCityOps from "./pages/admin/AdminCityOps";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
        <Route path="/therapist/:id" element={<PageTransition><TherapistProfile /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQPage /></PageTransition>} />
        <Route path="/safety" element={<PageTransition><Safety /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/city/:slug" element={<PageTransition><City /></PageTransition>} />
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
        </Route>
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
        </Route>
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
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
