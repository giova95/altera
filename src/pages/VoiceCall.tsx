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
    console.log("=== CALL END STARTED ===");
    console.log("Conversation ID:", conversationId);
    
    if (!conversationId) {
      console.log("No conversation ID, navigating to workspace");
      navigate("/workspace");
      return;
    }

    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(`User fetch failed: ${userError?.message || "No user found"}`);
      }
      console.log("User ID:", user.id);

      // Get user's profile to get work_role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("work_role")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      console.log("User work_role:", profile?.work_role);

      const state = location.state as any;
      console.log("Location state:", state);

      // Create simulation record with conversation_id
      const simulationData = {
        user_id: user.id,
        persona_id: state?.personaId || null,
        theme: (state?.theme || "other") as "feedback" | "performance" | "conflict" | "workload" | "change_decision" | "other",
        emotion: (state?.emotion || null) as "anxious" | "guilty" | "frustrated" | "calm_unsure" | "confident" | "other" | null,
        context: state?.context || "",
        user_role: (profile?.work_role || "other") as "individual_contributor" | "manager" | "hr" | "leadership" | "other",
        other_role: "other" as "individual_contributor" | "manager" | "hr" | "leadership" | "other",
        is_using_persona: true,
        conversation_id: conversationId,
        completed_at: new Date().toISOString(),
      };
      console.log("Creating simulation with data:", simulationData);

      const { data: simulation, error: simError } = await supabase
        .from("simulations")
        .insert(simulationData)
        .select()
        .single();

      if (simError) {
        console.error("Simulation insert error:", simError);
        throw simError;
      }
      console.log("Simulation created:", simulation);

      // Wait a bit for ElevenLabs to process the conversation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch conversation data from ElevenLabs
      console.log("Fetching conversation data from ElevenLabs...");
      const { data: conversationData, error: convError } = await supabase.functions.invoke(
        "elevenlabs-conversation",
        {
          body: { conversationId },
        }
      );

      if (convError) {
        console.error("Error fetching conversation:", convError);
      } else {
        console.log("Conversation data received:", conversationData);
      }

      // Store transcript messages if available
      if (conversationData?.transcript && Array.isArray(conversationData.transcript)) {
        console.log("Processing transcript with", conversationData.transcript.length, "messages");
        
        const messages = conversationData.transcript.map((msg: any) => ({
          simulation_id: simulation.id,
          role: msg.role === "agent" ? "assistant" : "user",
          content: msg.message || msg.text || "",
        }));

        console.log("Inserting messages:", messages);
        const { error: msgError } = await supabase
          .from("simulation_messages")
          .insert(messages);

        if (msgError) {
          console.error("Error saving messages:", msgError);
        } else {
          console.log("Messages saved successfully");
        }
      } else {
        console.log("No transcript data available");
      }

      console.log("=== CALL END COMPLETED SUCCESSFULLY ===");
      toast({
        title: "Call ended",
        description: "Conversation saved successfully",
      });

      navigate("/workspace");
    } catch (error) {
      console.error("=== ERROR SAVING CONVERSATION ===");
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save conversation",
        variant: "destructive",
      });
      navigate("/workspace");
    }
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
                  {isStarting ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Phone className="h-8 w-8" />
                  )}
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
                  <Button
                    onClick={endCall}
                    variant="destructive"
                    className="h-16 w-16 rounded-full"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>

            {conversation.status === "disconnected" && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click the phone button to start the call
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure your microphone is enabled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VoiceCall;
