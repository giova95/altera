import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface ProcessingStepProps {
  onComplete: () => void;
}

export const ProcessingStep = ({ onComplete }: ProcessingStepProps) => {
  useEffect(() => {
    // Placeholder: In real implementation, poll backend for persona creation status
    // For now, auto-advance after 3 seconds for demo purposes
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-soft border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Your AI persona is being created</CardTitle>
          <CardDescription>
            This will take a few minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <div className="bg-gradient-subtle rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>Transcribing your voice recordings</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100" />
                  <span>Analyzing your communication style</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                  <span>Creating your unique voice profile</span>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>What's happening:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
                <li>• We're creating a unique voice profile for realistic text-to-speech</li>
                <li>• Our AI is analyzing your answers to model your communication patterns</li>
                <li>• The persona will learn your preferences for giving and receiving feedback</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              You can navigate away from this page. We'll notify you when your persona is ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
