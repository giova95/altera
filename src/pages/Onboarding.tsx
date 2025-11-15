import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type WorkRole = "individual_contributor" | "manager" | "hr" | "leadership" | "other";
type Theme = "feedback" | "conflict" | "workload" | "change_decision" | "other";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [workRole, setWorkRole] = useState<WorkRole | null>(null);
  const [focusArea, setFocusArea] = useState<Theme | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleComplete = async () => {
    if (!workRole) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("profiles")
        .update({ work_role: workRole })
        .eq("id", user.id);

      toast({
        title: "Profile updated!",
        description: "Let's start improving your communication skills.",
      });

      navigate("/workspace");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Altera</h1>
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {step === 1 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>What's your role?</CardTitle>
              <CardDescription>
                This helps us tailor simulations and coaching to your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={workRole || ""} onValueChange={(value) => setWorkRole(value as WorkRole)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="individual_contributor" id="ic" />
                  <Label htmlFor="ic" className="cursor-pointer flex-1">
                    <div className="font-medium">Individual Contributor</div>
                    <div className="text-sm text-muted-foreground">Focus on collaboration and communication</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="manager" id="manager" />
                  <Label htmlFor="manager" className="cursor-pointer flex-1">
                    <div className="font-medium">Manager</div>
                    <div className="text-sm text-muted-foreground">Lead teams and provide feedback</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="hr" id="hr" />
                  <Label htmlFor="hr" className="cursor-pointer flex-1">
                    <div className="font-medium">HR Professional</div>
                    <div className="text-sm text-muted-foreground">Handle sensitive conversations</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="leadership" id="leadership" />
                  <Label htmlFor="leadership" className="cursor-pointer flex-1">
                    <div className="font-medium">Leadership</div>
                    <div className="text-sm text-muted-foreground">Drive organizational change</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer flex-1">
                    <div className="font-medium">Other</div>
                    <div className="text-sm text-muted-foreground">I'll specify later</div>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                onClick={() => setStep(2)}
                disabled={!workRole}
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
              <CardTitle>What do you want to improve first?</CardTitle>
              <CardDescription>
                We'll help you practice these conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={focusArea || ""} onValueChange={(value) => setFocusArea(value as Theme)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="feedback" id="feedback" />
                  <Label htmlFor="feedback" className="cursor-pointer flex-1">
                    <div className="font-medium">Giving & receiving feedback</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="conflict" id="conflict" />
                  <Label htmlFor="conflict" className="cursor-pointer flex-1">
                    <div className="font-medium">Handling conflicts</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="workload" id="workload" />
                  <Label htmlFor="workload" className="cursor-pointer flex-1">
                    <div className="font-medium">Workload & boundaries</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="change_decision" id="change" />
                  <Label htmlFor="change" className="cursor-pointer flex-1">
                    <div className="font-medium">Communicating changes & decisions</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="other" id="other-focus" />
                  <Label htmlFor="other-focus" className="cursor-pointer flex-1">
                    <div className="font-medium">Other areas</div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!focusArea}
                  className="flex-1"
                >
                  Get started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;