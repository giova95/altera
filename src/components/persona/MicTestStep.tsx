import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Play, RotateCcw } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface MicTestStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const MicTestStep = ({ onContinue, onBack }: MicTestStepProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
      const setupAudioLevel = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          
          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;
          microphone.connect(analyser);

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateLevel = () => {
            if (analyser && isRecording) {
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(Math.min(100, (average / 255) * 100 * 2));
              requestAnimationFrame(updateLevel);
            }
          };
          
          updateLevel();
        } catch (error) {
          console.error('Failed to setup audio level:', error);
        }
      };
      
      setupAudioLevel();
    } else {
      setAudioLevel(0);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [isRecording]);

  const handlePlayback = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    resetRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-soft border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Test your microphone</CardTitle>
          <CardDescription>
            Let's make sure we can hear you clearly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              {!audioUrl && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Input level</span>
                      <span className="font-medium">{Math.round(audioLevel)}%</span>
                    </div>
                    <Progress value={audioLevel} className="h-2" />
                  </div>

                  <div className="text-center space-y-4">
                    {isRecording && (
                      <div className="text-lg font-semibold text-primary">
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="w-full"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {isRecording ? 'Stop recording' : 'Start test recording'}
                    </Button>
                    
                    {!isRecording && (
                      <p className="text-sm text-muted-foreground">
                        Record a 5–10 second sample to test your audio
                      </p>
                    )}
                  </div>
                </>
              )}

              {audioUrl && (
                <>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  
                  <div className="text-center space-y-4">
                    <div className="text-lg font-semibold text-foreground">
                      Recording complete! ({formatTime(recordingTime)})
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePlayback}
                        variant="outline"
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isPlaying ? 'Stop playback' : 'Play recording'}
                      </Button>
                      
                      <Button
                        onClick={handleReset}
                        variant="outline"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Listen to your recording to make sure the audio quality is good
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button
              onClick={onContinue}
              disabled={!audioUrl}
            >
              Continue to interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
