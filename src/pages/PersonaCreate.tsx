import { useState } from 'react';
import { ConsentStep } from '@/components/persona/ConsentStep';
import { MicTestStep } from '@/components/persona/MicTestStep';
import { InterviewStep } from '@/components/persona/InterviewStep';
import { ProcessingStep } from '@/components/persona/ProcessingStep';
import { ConfirmationStep } from '@/components/persona/ConfirmationStep';

type Step = 'consent' | 'micTest' | 'interview' | 'processing' | 'confirmation';

const PersonaCreate = () => {
  const [currentStep, setCurrentStep] = useState<Step>('consent');

  const renderStep = () => {
    switch (currentStep) {
      case 'consent':
        return <ConsentStep onContinue={() => setCurrentStep('micTest')} />;
      
      case 'micTest':
        return (
          <MicTestStep
            onContinue={() => setCurrentStep('interview')}
            onBack={() => setCurrentStep('consent')}
          />
        );
      
      case 'interview':
        return (
          <InterviewStep
            onContinue={() => setCurrentStep('processing')}
            onBack={() => setCurrentStep('micTest')}
          />
        );
      
      case 'processing':
        return <ProcessingStep onComplete={() => setCurrentStep('confirmation')} />;
      
      case 'confirmation':
        return <ConfirmationStep />;
      
      default:
        return null;
    }
  };

  const stepIndicators = [
    { key: 'consent', label: 'Consent' },
    { key: 'micTest', label: 'Mic Test' },
    { key: 'interview', label: 'Interview' },
    { key: 'processing', label: 'Processing' },
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

export default PersonaCreate;
