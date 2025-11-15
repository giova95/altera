import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Workspace from "./pages/Workspace";
import ScenarioSetup from "./pages/ScenarioSetup";
import VoiceCall from "./pages/VoiceCall";
import PersonaCreate from "./pages/PersonaCreate";
import PersonaDemo from "./pages/PersonaDemo";
import PersonaManagement from "./pages/PersonaManagement";
import NotFound from "./pages/NotFound";

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/scenario/setup" element={<ScenarioSetup />} />
          <Route path="/voice-call" element={<VoiceCall />} />
          <Route path="/persona/create" element={<PersonaCreate />} />
          <Route path="/persona/demo" element={<PersonaDemo />} />
          <Route path="/persona/management" element={<PersonaManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
