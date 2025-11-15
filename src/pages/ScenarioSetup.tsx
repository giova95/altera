import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Theme = "feedback" | "performance" | "conflict" | "workload" | "change_decision" | "other";
type Emotion = "anxious" | "guilty" | "frustrated" | "calm_unsure" | "confident" | "other";

interface AIPersona {
  id: string;
  voice_profile_id: string | null;
  user_id: string;
  consent_given: boolean;
  profiles: {
    full_name: string | null;
    work_role: string | null;
  } | null;
}

const ScenarioSetup = () => {
  const [step, setStep] = useState(1);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [context, setContext] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get all personas with consent, excluding the current user's persona
      const { data, error } = await supabase
        .from("ai_personas")
        .select(`
          *,
          profiles (
            full_name,
            work_role
          )
        `)
        .eq("consent_given", true)
        .neq("user_id", user.id);

      if (error) throw error;

      setPersonas(data || []);
    } catch (error) {
      console.error("Error loading personas:", error);
      toast({
        title: "Error",
        description: "Failed to load AI personas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    // Navigate to voice call simulation with parameters
    const params = new URLSearchParams({
      personaId: selectedPersonaId!,
      theme: theme!,
      emotion: emotion!,
      ...(context && { context }),
    });
    navigate(`/voice-call?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/workspace")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to workspace
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Set up your scenario</h2>
          <p className="text-muted-foreground">
            Step {step} of 3
          </p>
        </div>

        {step === 1 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Choose an AI persona to practice with</CardTitle>
              <CardDescription>
                Select which AI persona you want to have a conversation with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : personas.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No AI personas available yet
                  </p>
                  <Button onClick={() => navigate("/persona/demo")}>
                    Create your first persona
                  </Button>
                </div>
              ) : (
                <>
                  <RadioGroup 
                    value={selectedPersonaId || ""} 
                    onValueChange={(value) => setSelectedPersonaId(value)}
                  >
                    {personas.map((persona) => {
                      const ownerName = persona.profiles?.full_name || "Unknown User";
                      const workRole = persona.profiles?.work_role 
                        ? persona.profiles.work_role.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')
                        : "No role specified";
                      
                      return (
                        <div 
                          key={persona.id}
                          className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={persona.id} id={`persona-${persona.id}`} />
                          <Label 
                            htmlFor={`persona-${persona.id}`} 
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-medium">{ownerName}</div>
                            <div className="text-sm text-muted-foreground">{workRole}</div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedPersonaId}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>What's the theme?</CardTitle>
              <CardDescription>
                What type of conversation is this?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={theme || ""} onValueChange={(value) => setTheme(value as Theme)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="feedback" id="theme-feedback" />
                  <Label htmlFor="theme-feedback" className="cursor-pointer flex-1 font-medium">
                    Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="performance" id="theme-performance" />
                  <Label htmlFor="theme-performance" className="cursor-pointer flex-1 font-medium">
                    Performance issue
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="conflict" id="theme-conflict" />
                  <Label htmlFor="theme-conflict" className="cursor-pointer flex-1 font-medium">
                    Conflict resolution
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="workload" id="theme-workload" />
                  <Label htmlFor="theme-workload" className="cursor-pointer flex-1 font-medium">
                    Workload & boundaries
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="change_decision" id="theme-change" />
                  <Label htmlFor="theme-change" className="cursor-pointer flex-1 font-medium">
                    Change or decision
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!theme} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>How are you feeling?</CardTitle>
              <CardDescription>
                Understanding your emotions helps us provide better coaching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={emotion || ""} onValueChange={(value) => setEmotion(value as Emotion)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="anxious" id="emotion-anxious" />
                  <Label htmlFor="emotion-anxious" className="cursor-pointer flex-1 font-medium">
                    Anxious / Nervous
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="frustrated" id="emotion-frustrated" />
                  <Label htmlFor="emotion-frustrated" className="cursor-pointer flex-1 font-medium">
                    Frustrated / Upset
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="calm_unsure" id="emotion-calm" />
                  <Label htmlFor="emotion-calm" className="cursor-pointer flex-1 font-medium">
                    Calm but unsure
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="confident" id="emotion-confident" />
                  <Label htmlFor="emotion-confident" className="cursor-pointer flex-1 font-medium">
                    Confident / Ready
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="context">Additional context (optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Describe the situation briefly..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleStart} disabled={!emotion} className="flex-1">
                  Start simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ScenarioSetup;