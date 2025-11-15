import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, CheckCircle2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/hooks/use-toast';

const INTERVIEW_QUESTIONS = [
  "Can you describe your role and your main responsibilities at work?",
  "How would you describe your communication style with colleagues?",
  "How do you usually react when there is a disagreement in your team?",
  "What makes you feel respected in a conversation at work?",
  "What typically frustrates you in communication at work?",
  "How do you prefer to receive feedback?",
  "How do you prefer to give feedback to others?",
  "Can you describe a recent challenging conversation and how you handled it?",
  "What are your values when it comes to teamwork and collaboration?",
  "Is there anything else about how you communicate that people should know?",
];

const MIN_TOTAL_SECONDS = 600; // 10 minutes

interface InterviewStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const InterviewStep = ({ onContinue, onBack }: InterviewStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; duration: number; blob: Blob | null }[]>([]);
  const [totalRecordedTime, setTotalRecordedTime] = useState(0);
  const { toast } = useToast();
  
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob && !isRecording) {
      // Save the answer
      const newAnswer = {
        questionId: currentQuestion,
        duration: recordingTime,
        blob: audioBlob,
      };
      
      setAnswers((prev) => [...prev, newAnswer]);
      setTotalRecordedTime((prev) => prev + recordingTime);
      
      // Placeholder: Upload answer to backend
      uploadAnswer(currentQuestion, audioBlob);
      
      toast({
        title: "Answer recorded",
        description: `Question ${currentQuestion + 1} completed (${formatTime(recordingTime)})`,
      });
      
      resetRecording();
    }
  }, [audioBlob, isRecording, currentQuestion, recordingTime, resetRecording, toast]);

  const uploadAnswer = async (questionId: number, audioFile: Blob) => {
    // Placeholder function for backend integration
    console.log(`Uploading answer for question ${questionId}:`, audioFile);
    // In real implementation:
    // const formData = new FormData();
    // formData.append('questionId', questionId.toString());
    // formData.append('audio', audioFile);
    // await fetch('/api/persona/upload-answer', { method: 'POST', body: formData });
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast({
        title: "Microphone error",
        description: "Please allow microphone access to continue.",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (totalRecordedTime < MIN_TOTAL_SECONDS) {
      toast({
        title: "More time needed",
        description: `Please record at least ${formatTime(MIN_TOTAL_SECONDS)} total. Current: ${formatTime(totalRecordedTime)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (answers.length < INTERVIEW_QUESTIONS.length) {
      toast({
        title: "Incomplete interview",
        description: "Please answer all questions before finishing.",
        variant: "destructive",
      });
      return;
    }
    
    onContinue();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuestionAnswered = answers.some((a) => a.questionId === currentQuestion);
  const progressPercentage = ((currentQuestion + 1) / INTERVIEW_QUESTIONS.length) * 100;
  const timeProgressPercentage = Math.min(100, (totalRecordedTime / MIN_TOTAL_SECONDS) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Voice Interview</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-subtle rounded-lg p-6 border border-border/50">
            <p className="text-lg leading-relaxed text-foreground">
              {INTERVIEW_QUESTIONS[currentQuestion]}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Current answer</div>
                {isRecording && (
                  <div className="text-2xl font-semibold text-primary">
                    {formatTime(recordingTime)}
                  </div>
                )}
                {isQuestionAnswered && !isRecording && (
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Answered</span>
                  </div>
                )}
              </div>

              <Button
                onClick={isRecording ? stopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    {isQuestionAnswered ? 'Re-record answer' : 'Start recording'}
                  </>
                )}
              </Button>
            </div>

            {!isRecording && !isQuestionAnswered && (
              <p className="text-sm text-muted-foreground text-center">
                Click "Start recording" and answer the question in your own words
              </p>
            )}
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total recorded time</span>
              <span className="text-lg font-semibold">
                {formatTime(totalRecordedTime)} / {formatTime(MIN_TOTAL_SECONDS)}
              </span>
            </div>
            <Progress value={timeProgressPercentage} className="h-2" />
            {totalRecordedTime < MIN_TOTAL_SECONDS && (
              <p className="text-xs text-muted-foreground mt-2">
                You need at least 10 minutes of total recording to create your persona
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={currentQuestion === 0 ? onBack : handlePreviousQuestion} variant="outline">
              Back
            </Button>
            
            <div className="flex gap-2">
              {currentQuestion < INTERVIEW_QUESTIONS.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isQuestionAnswered}
                >
                  Next question
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={answers.length < INTERVIEW_QUESTIONS.length || totalRecordedTime < MIN_TOTAL_SECONDS}
                >
                  Finish interview
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
