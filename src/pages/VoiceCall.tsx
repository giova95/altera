import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, PhoneOff, Loader2, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoiceCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string>("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      toast({
        title: "Call connected",
        description: "You can now speak with the AI persona",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      handleCallEnd();
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to voice service",
        variant: "destructive",
      });
      setIsStarting(false);
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
  });

  useEffect(() => {
    // Get agent ID from location state
    const state = location.state as any;
    if (state?.agentId) {
      setAgentId(state.agentId);
    }
  }, [location]);

  const startCall = async () => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "No agent ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(true);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-session", {
        body: { agentId },
      });

      if (error) throw error;

      if (!data?.signed_url) {
        throw new Error("No signed URL received");
      }

      console.log("Starting conversation with signed URL");

      // Start the conversation
      const id = await conversation.startSession({
        signedUrl: data.signed_url,
      });

      setConversationId(id);
      console.log("Conversation started with ID:", id);
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start call",
        variant: "destructive",
      });
      setIsStarting(false);
    }
  };

  const endCall = async () => {
    await conversation.endSession();
  };

  const handleCallEnd = async () => {
    if (!conversationId) {
      navigate("/dashboard");
      return;
    }

    try {
      // Fetch conversation data from ElevenLabs
      const { data: conversationData, error: convError } = await supabase.functions.invoke("elevenlabs-conversation", {
        body: { conversationId },
      });

      if (convError) {
        console.error("Error fetching conversation:", convError);
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get user's profile to get work_role
      const { data: profile } = await supabase.from("profiles").select("work_role").eq("id", user.id).single();

      const state = location.state as any;

      // Create simulation record
      const { data: simulation, error: simError } = await supabase
        .from("simulations")
        .insert({
          user_id: user.id,
          persona_id: state?.personaId || null,
          theme: state?.theme || "other",
          emotion: state?.emotion || null,
          context: state?.context || "",
          user_role: profile?.work_role || "other",
          other_role: "other",
          is_using_persona: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (simError) throw simError;

      // Store transcript messages if available
      if (conversationData?.transcript) {
        const messages = conversationData.transcript.map((msg: any) => ({
          simulation_id: simulation.id,
          role: msg.role === "agent" ? "assistant" : "user",
          content: msg.message,
        }));

        const { error: msgError } = await supabase.from("simulation_messages").insert(messages);

        if (msgError) {
          console.error("Error saving messages:", msgError);
        }
      }

      toast({
        title: "Call ended",
        description: "Conversation saved successfully",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Voice Call</CardTitle>
            <CardDescription>
              {conversation.status === "connected"
                ? "You are now connected to the AI persona"
                : "Start a voice conversation with the AI persona"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8">
              {conversation.status === "disconnected" ? (
                <Button
                  onClick={startCall}
                  disabled={isStarting || !agentId}
                  className="h-24 w-24 rounded-full"
                  size="lg"
                >
                  {isStarting ? <Loader2 className="h-8 w-8 animate-spin" /> : <Phone className="h-8 w-8" />}
                </Button>
              ) : (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    {conversation.isSpeaking ? (
                      <Mic className="h-8 w-8 text-primary" />
                    ) : (
                      <MicOff className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conversation.isSpeaking ? "AI is speaking..." : "Listening..."}
                  </p>
                  <Button onClick={endCall} variant="destructive" className="h-16 w-16 rounded-full">
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>

            {conversation.status === "disconnected" && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Click the phone button to start the call</p>
                <p className="text-xs text-muted-foreground">Make sure your microphone is enabled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VoiceCall;
