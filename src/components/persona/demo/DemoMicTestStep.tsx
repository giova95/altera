import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface DemoMicTestStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const DemoMicTestStep = ({ onContinue, onBack }: DemoMicTestStepProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const {
    isRecording,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (isRecording) {
      setupAudioAnalysis();
    } else {
      cleanupAudioAnalysis();
    }

    return () => {
      cleanupAudioAnalysis();
    };
  }, [isRecording]);

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 128) * 100));

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const cleanupAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const handlePlayback = () => {
    if (!audioUrl) return;

    if (isPlayingBack) {
      audioElementRef.current?.pause();
      setIsPlayingBack(false);
    } else {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.play();
      setIsPlayingBack(true);

      audio.onended = () => {
        setIsPlayingBack(false);
      };
    }
  };

  const handleReset = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingBack(false);
    }
    resetRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Microphone Test</CardTitle>
          <CardDescription>
            Test your microphone to ensure clear audio recording
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Input Level</span>
              {isRecording && (
                <span className="text-primary font-medium">Recording: {formatTime(recordingTime)}</span>
              )}
            </div>
            <Progress value={audioLevel} className="h-2" />
            {!isRecording && !audioUrl && (
              <p className="text-xs text-muted-foreground">
                Click "Record Test" and speak to see the input level
              </p>
            )}
          </div>

          {!audioUrl ? (
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Test Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Record Test Sample
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  Test recording complete • {formatTime(recordingTime)}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={handlePlayback} variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  {isPlayingBack ? 'Playing...' : 'Play Test Sample'}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={onContinue} disabled={!audioUrl}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
