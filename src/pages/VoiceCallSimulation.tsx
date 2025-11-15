import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Conversation } from "@11labs/client";

const VoiceCallSimulation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const personaId = searchParams.get("personaId");
  const theme = searchParams.get("theme");
  const emotion = searchParams.get("emotion");
  const context = searchParams.get("context");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const conversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    if (!personaId) {
      toast({
        title: "Error",
        description: "No persona selected",
        variant: "destructive",
      });
      navigate("/scenario/setup");
    }
  }, [personaId, navigate, toast]);

  const startCall = async () => {
    try {
      setIsConnecting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Get the persona to find the agent ID (voice_profile_id)
      const { data: persona, error: personaError } = await supabase
        .from("ai_personas")
        .select("voice_profile_id")
        .eq("id", personaId)
        .single();

      if (personaError || !persona?.voice_profile_id) {
        throw new Error("Persona not found");
      }

      // Get signed URL from backend
      const { data: urlData, error: urlError } = await supabase.functions.invoke(
        "elevenlabs-get-signed-url",
        {
          body: { agentId: persona.voice_profile_id },
        }
      );

      if (urlError || !urlData?.signed_url) {
        throw new Error("Failed to get signed URL");
      }

      // Initialize ElevenLabs conversation
      const conversation = await Conversation.startSession({
        signedUrl: urlData.signed_url,
        onConnect: (eventData: any) => {
          console.log("Connected to ElevenLabs", eventData);
          setIsConnected(true);
          setIsConnecting(false);
          // Extract conversation ID from event data if available
          if (eventData?.conversationId) {
            setConversationId(eventData.conversationId);
          }
        },
        onDisconnect: () => {
          console.log("Disconnected from ElevenLabs");
          handleEndCall();
        },
        onMessage: (message) => {
          console.log("Message:", message);
          // Try to extract conversation ID from message
          if ((message as any)?.conversationId && !conversationId) {
            setConversationId((message as any).conversationId);
          }
        },
        onError: (error) => {
          console.error("Conversation error:", error);
          toast({
            title: "Connection Error",
            description: "Failed to maintain connection",
            variant: "destructive",
          });
        },
        onModeChange: (mode) => {
          console.log("Mode changed:", mode);
          setIsSpeaking(mode.mode === "speaking");
        },
      });

      conversationRef.current = conversation;

    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start call",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleEndCall = async () => {
    try {
      // End the conversation
      if (conversationRef.current) {
        await conversationRef.current.endSession();
        conversationRef.current = null;
      }

      // If we have a conversation ID, fetch the conversation data
      if (conversationId) {
        await saveConversation();
      }

      setIsConnected(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error ending call:", error);
      toast({
        title: "Error",
        description: "Failed to end call properly",
        variant: "destructive",
      });
    }
  };

  const saveConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !conversationId) return;

      // Fetch conversation data from ElevenLabs
      const { data: convData, error: convError } = await supabase.functions.invoke(
        "elevenlabs-get-conversation",
        {
          body: { conversationId },
        }
      );

      if (convError) {
        console.error("Error fetching conversation:", convError);
        return;
      }

      // Extract transcript and analysis
      const transcript = convData?.transcript || "";
      const analysis = convData?.analysis || {};

      // Save to simulations table
      const { error: saveError } = await supabase
        .from("simulations")
        .insert({
          user_id: user.id,
          persona_id: personaId,
          theme: theme as any,
          emotion: emotion as any,
          context: context || `Voice call simulation. ${JSON.stringify(analysis)}`,
          is_using_persona: true,
          completed_at: new Date().toISOString(),
          user_role: "individual_contributor",
          other_role: "manager",
        });

      if (saveError) {
        console.error("Error saving simulation:", saveError);
      } else {
        toast({
          title: "Success",
          description: "Conversation saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const toggleMute = () => {
    if (conversationRef.current) {
      conversationRef.current.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-8">
            {/* Visual indicator */}
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isSpeaking
                    ? "bg-primary/20 ring-8 ring-primary/30"
                    : "bg-muted"
                }`}
              >
                <Phone className="w-16 h-16 text-primary" />
              </div>
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </div>

            {/* Status text */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {!isConnected && !isConnecting && "Ready to Start"}
                {isConnecting && "Connecting..."}
                {isConnected && (isSpeaking ? "AI Speaking" : "Listening")}
              </h2>
              <p className="text-muted-foreground">
                {!isConnected && !isConnecting && "Press start to begin the conversation"}
                {isConnecting && "Setting up the call"}
                {isConnected && "Voice call in progress"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              {!isConnected && !isConnecting && (
                <Button
                  onClick={startCall}
                  size="lg"
                  className="gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Start Call
                </Button>
              )}

              {isConnecting && (
                <Button disabled size="lg" className="gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting
                </Button>
              )}

              {isConnected && (
                <>
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    {isMuted ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Mute
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                    End Call
                  </Button>
                </>
              )}
            </div>

            {/* Context info */}
            {isConnected && (
              <div className="w-full p-4 bg-muted/50 rounded-lg space-y-1 text-sm">
                <p><strong>Theme:</strong> {theme}</p>
                <p><strong>Emotion:</strong> {emotion}</p>
                {context && <p><strong>Context:</strong> {context}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCallSimulation;
