import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

type WorkRole = "individual_contributor" | "manager" | "hr" | "leadership" | "other";
type Theme = "feedback" | "performance" | "conflict" | "workload" | "change_decision" | "other";
type Emotion = "anxious" | "guilty" | "frustrated" | "calm_unsure" | "confident" | "other";

const ScenarioSetup = () => {
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<WorkRole | null>(null);
  const [otherRole, setOtherRole] = useState<WorkRole | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [context, setContext] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    // In a real implementation, this would create a simulation and navigate to it
    console.log({ userRole, otherRole, theme, emotion, context });
    navigate("/simulation/demo");
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
            Step {step} of 4
          </p>
        </div>

        {step === 1 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>In this scenario, I am...</CardTitle>
              <CardDescription>
                Select your role in this conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={userRole || ""} onValueChange={(value) => setUserRole(value as WorkRole)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="individual_contributor" id="user-ic" />
                  <Label htmlFor="user-ic" className="cursor-pointer flex-1 font-medium">
                    Individual Contributor
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="manager" id="user-manager" />
                  <Label htmlFor="user-manager" className="cursor-pointer flex-1 font-medium">
                    Manager
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="hr" id="user-hr" />
                  <Label htmlFor="user-hr" className="cursor-pointer flex-1 font-medium">
                    HR Professional
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="leadership" id="user-leadership" />
                  <Label htmlFor="user-leadership" className="cursor-pointer flex-1 font-medium">
                    Leadership
                  </Label>
                </div>
              </RadioGroup>

              <Button
                onClick={() => setStep(2)}
                disabled={!userRole}
                className="w-full"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>I need to talk to...</CardTitle>
              <CardDescription>
                Who is the other person in this conversation?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={otherRole || ""} onValueChange={(value) => setOtherRole(value as WorkRole)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="manager" id="other-manager" />
                  <Label htmlFor="other-manager" className="cursor-pointer flex-1 font-medium">
                    My Manager
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="individual_contributor" id="other-report" />
                  <Label htmlFor="other-report" className="cursor-pointer flex-1 font-medium">
                    My Direct Report
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="individual_contributor" id="other-peer" />
                  <Label htmlFor="other-peer" className="cursor-pointer flex-1 font-medium">
                    A Peer / Colleague
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="hr" id="other-hr" />
                  <Label htmlFor="other-hr" className="cursor-pointer flex-1 font-medium">
                    HR
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="leadership" id="other-leadership" />
                  <Label htmlFor="other-leadership" className="cursor-pointer flex-1 font-medium">
                    Leadership
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!otherRole} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
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
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!theme} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
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
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
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