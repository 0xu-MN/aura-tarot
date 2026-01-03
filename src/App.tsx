import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
// ... imports ...

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contents" element={<Contents />} />
            <Route path="/contents/work" element={<WorkLuck />} />
            <Route path="/tarot/weekly" element={<WeeklyFortune />} />
            <Route path="/tarot/monthly" element={<MonthlyFortune />} />
            <Route path="/tarot/love" element={<LoveTarot />} />
            <Route path="/tarot/reunion" element={<ReunionTarot />} />
            <Route path="/tarot/:type" element={<TarotReading />} />
            <Route path="/tarot/student" element={<StudentSupportTarot />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/tarot/new-year" element={<NewYearTarot />} />
            <Route path="/compatibility" element={<CompatibilityTarot />} />
            <Route path="/groups" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/lounge" element={<CommunityLounge />} />
            <Route path="/profile/:userId" element={<CommunityLounge />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
