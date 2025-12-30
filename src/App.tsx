import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Contents from "./pages/Contents";
import TarotReading from "./pages/TarotReading";
import Chatbot from "./pages/Chatbot";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CommunityLounge from "./pages/CommunityLounge";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import { StudentSupportTarot } from './pages/contents/StudentSupportTarot';
import { WorkLuck } from "./pages/contents/WorkLuck";
import WeeklyFortune from "./pages/contents/WeeklyFortune";
import MonthlyFortune from "./pages/contents/MonthlyFortune";
import { LoveTarot } from "./pages/contents/LoveTarot";
import { ReunionTarot } from "./pages/contents/ReunionTarot";
import { NewYearTarot } from "./pages/contents/NewYearTarot";
import { CompatibilityTarot } from "./pages/contents/CompatibilityTarot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
