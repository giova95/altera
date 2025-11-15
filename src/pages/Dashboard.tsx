import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut, Mic, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loadingSimulations, setLoadingSimulations] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Load persona
      const { data: personaData } = await supabase
        .from("ai_personas")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setPersona(personaData);

      // Load recent simulations with conversation data
      await fetchSimulations(session.user.id);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePlayTestVoice = async () => {
    if (!persona?.voice_profile_id) return;

    setIsPlayingTest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to test your voice");
        setIsPlayingTest(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            voiceId: persona.voice_profile_id,
            text: "This is my AI voice speaking from Altera.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingTest(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlayingTest(false);
        URL.revokeObjectURL(audioUrl);
        toast.error("Failed to play audio");
      };
      
      await audio.play();
    } catch (error) {
      console.error("Error playing test voice:", error);
      toast.error("Failed to play test voice");
      setIsPlayingTest(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleName = (workRole: string) => {
    const roleMap: { [key: string]: string } = {
      individual_contributor: "Employee",
      manager: "Manager",
      hr: "HR",
      leadership: "Leadership",
      other: "Other",
    };
    return roleMap[workRole] || "Employee";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hi, {profile?.full_name || user?.email}</h1>
            <p className="text-muted-foreground">Role: {getRoleName(profile?.work_role)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              This tool is provided by your company to help you practice work conversations in a safe space.
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Persona Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Your AI Persona
              </CardTitle>
              <CardDescription>
                {persona ? "Status: Active" : "No persona created yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {persona ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    This AI voice is based on your short recording and is used in simulations.
                  </p>
                  <Button 
                    onClick={handlePlayTestVoice} 
                    disabled={isPlayingTest}
                    className="w-full"
                  >
                    {isPlayingTest ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Play Test Voice
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    You don't have an AI persona yet.
                  </p>
                  <Button onClick={() => navigate("/persona/demo")} className="w-full">
                    Create My AI Persona
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Start New Conversation */}
          <Card>
            <CardHeader>
              <CardTitle>Start a New Conversation</CardTitle>
              <CardDescription>
                Simulate a work conversation and practice how you want to respond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/scenario/setup")} 
                className="w-full"
                variant="default"
              >
                New Simulation
              </Button>
            </CardContent>
          </Card>

          {/* Recent Simulations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Simulations</CardTitle>
              <CardDescription>
                Your conversation practice history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSimulations ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading simulations...</p>
                </div>
              ) : simulations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't run any simulations yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {simulations.map((sim) => (
                    <div 
                      key={sim.id} 
                      className="border border-border/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {sim.theme.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {sim.context && (
                        <p className="text-sm text-foreground">{sim.context}</p>
                      )}
                      {sim.conversationData?.analysis?.summary && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-foreground">Summary</h4>
                          <p className="text-xs text-muted-foreground">
                            {sim.conversationData.analysis.summary}
                          </p>
                        </div>
                      )}
                      {sim.conversationData?.analysis?.transcript && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-foreground">Transcription</h4>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {sim.conversationData.analysis.transcript}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
