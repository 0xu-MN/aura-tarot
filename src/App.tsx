import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Contents from "./pages/Contents";
import { LoveTarot } from "./pages/contents/LoveTarot";
import { ReunionTarot } from "./pages/contents/ReunionTarot";
import { CompatibilityTarot } from "./pages/contents/CompatibilityTarot";
import { YearlyFortune } from "./pages/contents/YearlyFortune";
import { MoneyTarot } from "./pages/contents/MoneyTarot";
import { PalmReading } from "./pages/contents/PalmReading";
import { Horoscope } from "./pages/contents/Horoscope";
import Chatbot from "./pages/Chatbot";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contents" element={<Contents />} />
            <Route path="/contents/love" element={<LoveTarot />} />
            <Route path="/contents/reunion" element={<ReunionTarot />} />
            <Route path="/contents/compatibility" element={<CompatibilityTarot />} />
            <Route path="/contents/yearly" element={<YearlyFortune />} />
            <Route path="/contents/money" element={<MoneyTarot />} />
            <Route path="/contents/palm" element={<PalmReading />} />
            <Route path="/contents/horoscope" element={<Horoscope />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
