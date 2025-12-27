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
import CompatibilityReading from "./pages/CompatibilityReading";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CommunityLounge from "./pages/CommunityLounge";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contents" element={<Contents />} />
            <Route path="/tarot/:type" element={<TarotReading />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/compatibility" element={<CompatibilityReading />} />
            <Route path="/groups" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/lounge" element={<CommunityLounge />} />
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
