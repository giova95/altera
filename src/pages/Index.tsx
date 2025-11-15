import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Target, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Altera
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered communication coach for workplace conversations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border/50 shadow-soft">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Practice Conversations</h3>
              <p className="text-sm text-muted-foreground">
                Rehearse difficult discussions with AI-powered simulations
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 shadow-soft">
              <Target className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Get Coaching</h3>
              <p className="text-sm text-muted-foreground">
                Receive real-time feedback and actionable tips
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 shadow-soft">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Build Confidence</h3>
              <p className="text-sm text-muted-foreground">
                Transform how you communicate at work
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="shadow-medium"
            >
              Get started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            For all roles: individual contributors, managers, HR, and leadership
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
