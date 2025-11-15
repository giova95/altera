import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DemoConsentStepProps {
  onContinue: () => void;
}

export const DemoConsentStep = ({ onContinue }: DemoConsentStepProps) => {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create your AI persona (demo)</CardTitle>
          <CardDescription>
            Quick demo to experience AI voice creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This demo will record a short voice sample (10–30 seconds) to create your AI voice persona.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p>
                <strong>What happens:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your audio will be sent to ElevenLabs to create a demo AI voice</li>
                <li>The AI persona is a simulation for communication coaching</li>
                <li>This is NOT a performance evaluation tool</li>
                <li>Your voice sample creates a unique voice profile for text-to-speech</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Privacy note:</strong> Your voice data is processed by ElevenLabs to create 
                your personalized AI voice. This demo is for coaching and training purposes only.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
            />
            <Label
              htmlFor="consent"
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              I understand and consent to creating my AI persona for this demo.
            </Label>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={onContinue}
              disabled={!consentGiven}
              size="lg"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
