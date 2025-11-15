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
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loadingSimulations, setLoadingSimulations] = useState(false);
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
        .single();
      setProfile(profileData);

      const { data: personaData } = await supabase
        .from("ai_personas")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setPersona(personaData);

      // Fetch recent simulations with conversation data
      await fetchSimulations(user.id);
    };

    getUser();
  }, [navigate]);

  const fetchSimulations = async (userId: string) => {
    setLoadingSimulations(true);
    try {
      const { data: simulationsData } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (simulationsData) {
        // Fetch conversation data for each simulation
        const enrichedSimulations = await Promise.all(
          simulationsData.map(async (sim) => {
            if (sim.conversation_id) {
              try {
                const { data: conversationData } = await supabase.functions.invoke(
                  "elevenlabs-conversation",
                  { body: { conversationId: sim.conversation_id } }
                );
                return { ...sim, conversationData };
              } catch (error) {
                console.error("Error fetching conversation:", error);
                return sim;
              }
            }
            return sim;
          })
        );
        setSimulations(enrichedSimulations);
      }
    } catch (error) {
      console.error("Error fetching simulations:", error);
    } finally {
      setLoadingSimulations(false);
    }
  };

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
              {loadingSimulations ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Loading...</p>
                </div>
              ) : simulations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No simulations yet</p>
                  <p className="text-xs mt-1">Start your first conversation above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {simulations.map((sim) => (
                    <div key={sim.id} className="border border-border/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{sim.theme}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {sim.context && (
                        <p className="text-sm text-foreground">{sim.context}</p>
                      )}
                      {sim.conversationData?.analysis?.transcript && (
                        <div className="space-y-2 mt-3">
                          <h4 className="text-xs font-semibold text-foreground">Transcription</h4>
                          <p className="text-xs text-muted-foreground">{sim.conversationData.analysis.transcript}</p>
                        </div>
                      )}
                      {sim.conversationData?.analysis?.summary && (
                        <div className="space-y-2 mt-3">
                          <h4 className="text-xs font-semibold text-foreground">Summary</h4>
                          <p className="text-xs text-muted-foreground">{sim.conversationData.analysis.summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Workspace;