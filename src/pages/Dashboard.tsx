import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut, Mic, PlayCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [simulations, setSimulations] = useState<any[]>([]);

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

      // Load recent simulations
      const { data: simulationsData } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setSimulations(simulationsData || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTestVoice = async () => {
    if (!persona?.voice_profile_id) return;

    setIsPlayingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: {
          voiceId: persona.voice_profile_id,
          text: "This is my AI voice speaking from Altera.",
        },
      });

      if (error) throw error;

      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { 
        type: "audio/mpeg" 
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingTest(false);
        URL.revokeObjectURL(audioUrl);
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
              {simulations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't run any simulations yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {simulations.map((sim) => (
                    <div 
                      key={sim.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => navigate(`/workspace?simulationId=${sim.id}`)}
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {sim.theme.replace(/_/g, " ")} - {sim.other_role.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
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
