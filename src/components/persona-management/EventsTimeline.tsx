import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PersonaEvent, addPersonaEvent, deletePersonaEvent } from '@/lib/personaApi';
import { useToast } from '@/hooks/use-toast';

interface EventsTimelineProps {
  personaId: string;
  events: PersonaEvent[];
  onEventsChange: () => void;
}

export const EventsTimeline = ({ personaId, events, onEventsChange }: EventsTimelineProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date>();
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  const handleAddEvent = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an event title.",
        variant: "destructive",
      });
      return;
    }

    if (!newDate) {
      toast({
        title: "Date required",
        description: "Please select an event date.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPersonaEvent(personaId, {
        title: newTitle,
        date: newDate.toISOString(),
        description: newDescription,
      });
      
      toast({
        title: "Event added",
        description: "The context event has been added successfully.",
      });
      
      setNewTitle('');
      setNewDate(undefined);
      setNewDescription('');
      setIsAdding(false);
      onEventsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deletePersonaEvent(personaId, eventId);
      
      toast({
        title: "Event removed",
        description: "The context event has been removed.",
      });
      
      onEventsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Context & Events</CardTitle>
            <CardDescription>
              Track important context that affects communication style
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add event
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Recently promoted to team lead"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !newDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional context about this event..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEvent}>Add event</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDate(undefined);
                  setNewDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sortedEvents.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No events added yet</p>
            <p className="text-xs mt-1">Add context events to improve persona accuracy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-6">
                {/* Timeline line */}
                {index < sortedEvents.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                
                <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
