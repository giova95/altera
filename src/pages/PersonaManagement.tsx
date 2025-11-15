import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, LogOut } from "lucide-react";
import { PersonaList } from "@/components/persona-management/PersonaList";
import { PersonaDetailsDialog } from "@/components/persona-management/PersonaDetailsDialog";

const PersonaManagement = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      // Fetch roles from secure roles table (RLS-protected)
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Failed to load roles", rolesError);
      }

      const isHrOrAdmin = (roles || []).some((r: any) => r.role === "hr" || r.role === "admin");

      // Optional UX redirect. Data access is enforced server-side via RLS.
      if (!isHrOrAdmin) {
        navigate("/dashboard");
        return;
      }

      // Fetch all personas with consent
      const { data: personasData } = await supabase
        .from("ai_personas")
        .select(
          `
          *,
          profile:user_id (
            full_name,
            work_role
          )
        `,
        )
        .eq("consent_given", true)
        .order("updated_at", { ascending: false });

      setPersonas(personasData || []);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleViewDetails = (persona: any) => {
    setSelectedPersona(persona);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Altera</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard")} variant="ghost" size="sm">
              My Workspace
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">AI Personas</h2>
          <p className="text-muted-foreground">
            Manage and refine AI personas for employees who have consented to use them for communication coaching.
          </p>
        </div>

        <Card className="mb-6 border-accent/50 bg-accent/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Important reminder</p>
              <p className="text-xs text-muted-foreground">
                AI personas are designed for communication practice and coaching. The traits and context you add here
                help create more realistic simulations. This data should not be used as formal performance evaluation.
              </p>
            </div>
          </CardContent>
        </Card>

        <PersonaList personas={personas} onViewDetails={handleViewDetails} />

        <PersonaDetailsDialog persona={selectedPersona} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </main>
    </div>
  );
};

export default PersonaManagement;
