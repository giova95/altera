import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DemoConfirmationStepProps {
  voiceId: string;
}

export const DemoConfirmationStep = ({ voiceId }: DemoConfirmationStepProps) => {
  const [testText, setTestText] = useState("This is my AI voice speaking from Altera.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlayTestVoice = async () => {
    if (!testText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to speak.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Ensure we have a valid user session and pass it to the edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to generate speech.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            voiceId,
            text: testText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Playback error",
          description: "Could not play the audio.",
          variant: "destructive",
        });
      };

      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: "Error",
        description: "Could not generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle>Your Demo AI Persona is Ready</CardTitle>
          <CardDescription>
            You can now test your AI voice and use it in future simulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <p className="text-sm text-center">
              <strong>Voice ID:</strong>{' '}
              <code className="text-xs bg-muted px-2 py-1 rounded">{voiceId}</code>
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="test-text">Test Your AI Voice</Label>
            <Input
              id="test-text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to speak..."
              disabled={isGenerating || isPlaying}
            />
            <p className="text-xs text-muted-foreground">
              Enter any text and click "Play Test Voice" to hear your AI persona speak.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handlePlayTestVoice}
              disabled={isGenerating || isPlaying || !testText.trim()}
              size="lg"
            >
              {isGenerating || isPlaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isGenerating ? 'Generating...' : 'Playing...'}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play Test Voice
                </>
              )}
            </Button>
          </div>

          <div className="pt-6 border-t">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Next Steps</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Your AI voice persona is now available for simulations</li>
                <li>HR can refine your persona with additional traits and context</li>
                <li>Use this for communication coaching and practice scenarios</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
