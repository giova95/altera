import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PersonaCreate from "./pages/PersonaCreate";
import PersonaManagement from "./pages/PersonaManagement";
import Workspace from "./pages/Workspace";
import ScenarioSetup from "./pages/ScenarioSetup";
import VoiceCallSimulation from "./pages/VoiceCallSimulation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/persona/create" element={<PersonaCreate />} />
          <Route path="/persona/management" element={<PersonaManagement />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/scenario/setup" element={<ScenarioSetup />} />
          <Route path="/voice-call" element={<VoiceCallSimulation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
