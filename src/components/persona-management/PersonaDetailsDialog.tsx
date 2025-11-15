import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { TraitsSection } from './TraitsSection';
import { EventsTimeline } from './EventsTimeline';
import { PersonaTrait, PersonaEvent } from '@/lib/personaApi';

interface Persona {
  id: string;
  user_id: string;
  status: string;
  updated_at: string;
  consent_timestamp: string | null;
  traits: any;
  context_events: any;
  profile: {
    full_name: string | null;
    work_role: string | null;
  };
}

interface PersonaDetailsDialogProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatWorkRole = (role: string | null) => {
  if (!role) return 'N/A';
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const PersonaDetailsDialog = ({ persona, open, onOpenChange }: PersonaDetailsDialogProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!persona) return null;

  // Parse traits and events from JSON
  const traits: PersonaTrait[] = Array.isArray(persona.traits) ? persona.traits : [];
  const events: PersonaEvent[] = Array.isArray(persona.context_events) ? persona.context_events : [];

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
    // TODO: Refetch persona data from Supabase
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {persona.profile.full_name || 'Unknown Employee'}
          </DialogTitle>
          <DialogDescription>
            Manage AI persona for communication coaching
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Consent reminder */}
          <Card className="border-accent/50 bg-accent/5">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Consent granted</p>
                <p className="text-xs text-muted-foreground">
                  This employee consented to persona creation on{' '}
                  {persona.consent_timestamp
                    ? format(new Date(persona.consent_timestamp), 'MMMM d, yyyy')
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important reminder */}
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">For coaching purposes only</p>
                <p className="text-xs text-muted-foreground">
                  AI personas are designed for communication practice and training. This data should
                  not be used as formal performance evaluation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="traits">Traits</TabsTrigger>
              <TabsTrigger value="events">Context & Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="shadow-soft border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Employee name</div>
                      <div className="font-medium">{persona.profile.full_name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Work role</div>
                      <div className="font-medium">{formatWorkRole(persona.profile.work_role)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Persona status</div>
                      <div>
                        {persona.status === 'active' && <Badge className="bg-accent">Active</Badge>}
                        {persona.status === 'in_progress' && <Badge variant="secondary">In creation</Badge>}
                        {persona.status === 'processing' && <Badge variant="secondary">Processing</Badge>}
                        {persona.status === 'failed' && <Badge variant="destructive">Failed</Badge>}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Last updated</div>
                      <div className="font-medium">
                        {format(new Date(persona.updated_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">Summary</div>
                    <p className="text-sm">
                      This AI persona has been created based on a voice interview and represents the
                      employee's professional communication style. It can be used in simulations to
                      help others practice conversations.
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-2">Current traits</div>
                    <div className="text-sm">
                      {traits.length} trait{traits.length !== 1 ? 's' : ''} added
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-2">Context events</div>
                    <div className="text-sm">
                      {events.length} event{events.length !== 1 ? 's' : ''} tracked
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traits" className="space-y-4 mt-4">
              <TraitsSection
                key={`traits-${refreshKey}`}
                personaId={persona.id}
                traits={traits}
                onTraitsChange={handleDataChange}
              />
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-4">
              <EventsTimeline
                key={`events-${refreshKey}`}
                personaId={persona.id}
                events={events}
                onEventsChange={handleDataChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
