import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, User, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const SimulationDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const simulationId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!simulationId) {
      navigate("/workspace");
      return;
    }
    loadSimulation();
  }, [simulationId]);

  const loadSimulation = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load simulation
      const { data: simData, error: simError } = await supabase
        .from("simulations")
        .select("*")
        .eq("id", simulationId)
        .eq("user_id", user.id)
        .single();

      if (simError) throw simError;
      setSimulation(simData);

      // Load messages
      const { data: messagesData, error: msgError } = await supabase
        .from("simulation_messages")
        .select("*")
        .eq("simulation_id", simulationId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading simulation:", error);
      toast({
        title: "Error",
        description: "Failed to load simulation details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Simulation Not Found</CardTitle>
            <CardDescription>
              The simulation you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/workspace")} className="w-full">
              Back to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTheme = (theme: string) => {
    return theme.replace(/_/g, " ").split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Conversation Practice</CardTitle>
            </div>
            <CardDescription className="mt-2">
              <div className="grid gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme:</span>
                  <span className="text-sm">{formatTheme(simulation.theme)}</span>
                </div>
                {simulation.emotion && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Emotion:</span>
                    <span className="text-sm capitalize">{simulation.emotion}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">
                    {new Date(simulation.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {simulation.is_using_persona && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mode:</span>
                    <span className="text-sm">Voice Conversation</span>
                  </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {simulation.context && (
          <Card className="shadow-soft mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{simulation.context}</p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-lg">Conversation Transcript</CardTitle>
            <CardDescription>
              {messages.length === 0 
                ? "No messages recorded for this conversation."
                : `${messages.length} messages exchanged`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transcript available for this conversation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-primary/20"
                          : "bg-accent/20"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div
                      className={`flex-1 rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/50 border border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {message.role === "user" ? "You" : "AI Persona"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SimulationDetail;
