import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, AlertCircle } from 'lucide-react';

interface ConsentStepProps {
  onContinue: () => void;
}

export const ConsentStep = ({ onContinue }: ConsentStepProps) => {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-soft border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Create your AI persona</CardTitle>
          <CardDescription className="text-base">
            Build a personalized AI version of your communication style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">What is an AI persona?</h3>
              <p>
                Your AI persona is a simulated version of your professional communication style. 
                It's created based on a 10-minute voice interview where you'll answer questions 
                about how you communicate at work.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">How will it be used?</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To create more realistic practice scenarios tailored to you</li>
                <li>To help colleagues practice conversations with "your" communication style</li>
                <li>To build a unique voice profile for text-to-speech simulations</li>
              </ul>
            </div>

            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-accent-foreground">What this is NOT:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Not a performance evaluation tool</li>
                    <li>Not a replacement for real human interaction</li>
                    <li>Not used for surveillance or monitoring</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Your privacy and control</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your voice recordings are used only to create your persona</li>
                <li>HR may add context or traits to refine your persona for better coaching</li>
                <li>All simulations are for learning and improvement, not evaluation</li>
                <li>You can update or delete your persona at any time</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked === true)}
              />
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I understand and consent to creating my AI persona. I understand that this will 
                involve a 10-minute voice recording, and that the resulting persona is a simulation 
                for coaching purposes only.
              </Label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={onContinue}
              disabled={!consentGiven}
              size="lg"
            >
              Continue to microphone test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
