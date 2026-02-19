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
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

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
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
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
