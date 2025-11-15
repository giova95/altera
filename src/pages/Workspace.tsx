import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Target, Users, Sparkles, LogOut } from "lucide-react";

const Workspace = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: personaData } = await supabase
        .from("ai_personas")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setPersona(personaData);
    };

    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getPersonaStatusBadge = () => {
    if (!persona) {
      return <Badge variant="outline">Not created</Badge>;
    }
    switch (persona.status) {
      case "active":
        return <Badge className="bg-accent">Active</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing...</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In progress</Badge>;
      default:
        return <Badge variant="outline">Not created</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Altera
          </h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || "there"}
          </h2>
          <p className="text-muted-foreground">
            Ready to practice your next conversation?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all cursor-pointer group">
            <CardHeader>
              <MessageSquare className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Conversation I need to have</CardTitle>
              <CardDescription>
                Prepare for a specific upcoming discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/scenario/setup")}>
                Start practicing
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all cursor-pointer group">
            <CardHeader>
              <Target className="w-10 h-10 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Situation that feels tense</CardTitle>
              <CardDescription>
                Work through anxiety or uncertainty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate("/scenario/setup")}>
                Explore scenario
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all cursor-pointer group">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Improve a relationship</CardTitle>
              <CardDescription>
                Build better connections at work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate("/scenario/setup")}>
                Get started
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My AI Persona</CardTitle>
                {getPersonaStatusBadge()}
              </div>
              <CardDescription>
                Create a personalized AI version for more realistic simulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!persona || persona.status === "not_created" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Your AI persona learns your communication style through a 10-minute voice interview.
                      This creates more realistic practice scenarios.
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => navigate("/persona/create")}>
                    Create my AI persona
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {persona.status === "processing" && "Your AI persona is being created. This may take a few minutes."}
                    {persona.status === "active" && "Your AI persona is ready! You can use it in simulations."}
                    {persona.status === "in_progress" && "Continue your voice interview to complete your persona."}
                  </p>
                  {persona.status === "active" && (
                    <Button className="w-full" variant="outline">
                      View persona details
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Recent Simulations</CardTitle>
              <CardDescription>
                Continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No simulations yet</p>
                <p className="text-xs mt-1">Start your first conversation above</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Workspace;