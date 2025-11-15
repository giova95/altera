import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { DemoConsentStep } from '@/components/persona/demo/DemoConsentStep';
import { DemoMicTestStep } from '@/components/persona/demo/DemoMicTestStep';
import { DemoRecordingStep } from '@/components/persona/demo/DemoRecordingStep';
import { DemoConfirmationStep } from '@/components/persona/demo/DemoConfirmationStep';

type Step = 'consent' | 'micTest' | 'recording' | 'confirmation';

const PersonaDemo = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('consent');
  const [voiceId, setVoiceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndPersona();
  }, []);

  const checkAuthAndPersona = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user already has a persona
      const { data: persona } = await supabase
        .from("ai_personas")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // If they have a persona, redirect to dashboard
      if (persona) {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'consent':
        return <DemoConsentStep onContinue={() => setCurrentStep('micTest')} />;
      
      case 'micTest':
        return (
          <DemoMicTestStep
            onContinue={() => setCurrentStep('recording')}
            onBack={() => setCurrentStep('consent')}
          />
        );
      
      case 'recording':
        return (
          <DemoRecordingStep
            onContinue={(id) => {
              setVoiceId(id);
              setCurrentStep('confirmation');
            }}
            onBack={() => setCurrentStep('micTest')}
          />
        );
      
      case 'confirmation':
        return <DemoConfirmationStep voiceId={voiceId} />;
      
      default:
        return null;
    }
  };

  const stepIndicators = [
    { key: 'consent', label: 'Consent' },
    { key: 'micTest', label: 'Mic Test' },
    { key: 'recording', label: 'Record' },
    { key: 'confirmation', label: 'Complete' },
  ];

  const currentStepIndex = stepIndicators.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Altera
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Step indicators */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {stepIndicators.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      index <= currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block ${
                      index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < stepIndicators.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className="animate-in fade-in duration-300">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default PersonaDemo;
