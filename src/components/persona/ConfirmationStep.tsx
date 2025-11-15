import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ConfirmationStep = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-soft border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-3xl">Your AI persona is ready!</CardTitle>
          <CardDescription className="text-base">Setup complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-subtle rounded-lg p-6 space-y-4">
            <div className="space-y-3 text-center">
              <p className="text-foreground">Your personalized AI persona has been successfully created.</p>

              <div className="bg-card border border-border rounded-lg p-4 text-left space-y-2 text-sm">
                <p className="font-semibold text-foreground">What you can do now:</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• Use your persona in conversation simulations</li>
                  <li>• Let colleagues practice conversations with your communication style</li>
                  <li>• Get more realistic and personalized coaching feedback</li>
                </ul>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-left text-sm">
                <p className="text-foreground">
                  <strong>Remember:</strong>
                </p>
                <p className="text-muted-foreground mt-1">
                  Your AI persona is a simulation created for coaching and practice. It's designed to help you and your
                  team improve communication, not to evaluate performance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate("/dashboard")} size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to My Space
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
