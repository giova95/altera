import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DemoRecordingStepProps {
  onContinue: (voiceId: string) => void;
  onBack: () => void;
}

const QUESTIONS = [
  "Can you briefly describe your role at work?",
  "How would you describe your communication style with others?",
  "What is one thing people should know about how you like to collaborate?"
];

const MIN_DURATION = 10;
const MAX_DURATION = 30;

export const DemoRecordingStep = ({ onContinue, onBack }: DemoRecordingStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [maxDurationReached, setMaxDurationReached] = useState(false);
  const { toast } = useToast();

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    setMaxDurationReached(false);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  // Auto-stop at max duration
  if (isRecording && recordingTime >= MAX_DURATION && !maxDurationReached) {
    setMaxDurationReached(true);
    stopRecording();
  }

  const canContinue = audioBlob && recordingTime >= MIN_DURATION && recordingTime <= MAX_DURATION;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmAndContinue = async () => {
    if (!audioBlob || !canContinue) return;

    setIsUploading(true);
    
    try {
      // Get the current session to ensure we have a valid auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create a voice");
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'demo-voice.webm');
      formData.append('displayName', 'Demo Persona');
      formData.append('description', 'Demo voice for Altera communication coach.');

      const { data, error } = await supabase.functions.invoke('elevenlabs-create-voice', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (!data.voiceId) {
        throw new Error('No voice ID returned from ElevenLabs');
      }

      toast({
        title: "Voice created successfully",
        description: "Your AI voice persona is ready to test!",
      });

      onContinue(data.voiceId);
    } catch (error) {
      console.error('Error creating voice:', error);
      toast({
        title: "Error creating voice",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Record Your Demo Voice Sample</CardTitle>
          <CardDescription>
            Record one continuous sample (10-30 seconds) answering the questions below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium">Answer these questions naturally while recording:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {QUESTIONS.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recording Duration</span>
              <span className={`font-mono font-medium ${
                recordingTime >= MIN_DURATION && recordingTime <= MAX_DURATION 
                  ? 'text-primary' 
                  : recordingTime > MAX_DURATION 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
              }`}>
                {formatTime(recordingTime)}
              </span>
            </div>
            <Progress 
              value={(recordingTime / MAX_DURATION) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum: {formatTime(MIN_DURATION)}</span>
              <span>Maximum: {formatTime(MAX_DURATION)}</span>
            </div>
          </div>

          {maxDurationReached && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum demo length reached. Recording stopped automatically.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              disabled={isUploading || (audioBlob !== null)}
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>

          {audioBlob && !canContinue && recordingTime < MIN_DURATION && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Recording too short. Please record at least {MIN_DURATION} seconds.
              </AlertDescription>
            </Alert>
          )}

          {audioBlob && canContinue && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-primary">
                ✓ Recording complete and ready to submit
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button onClick={onBack} variant="outline" disabled={isUploading}>
              Back
            </Button>
            <Button 
              onClick={handleConfirmAndContinue} 
              disabled={!canContinue || isUploading}
            >
              {isUploading ? 'Creating Voice...' : 'Confirm & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
