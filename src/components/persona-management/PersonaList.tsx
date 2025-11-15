import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Persona {
  id: string;
  user_id: string;
  status: string;
  updated_at: string;
  consent_timestamp: string | null;
  profile: {
    full_name: string | null;
    work_role: string | null;
  };
}

interface PersonaListProps {
  personas: Persona[];
  onViewDetails: (persona: Persona) => void;
}

const formatWorkRole = (role: string | null) => {
  if (!role) return 'N/A';
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-accent">Active</Badge>;
    case 'in_progress':
      return <Badge variant="secondary">In creation</Badge>;
    case 'processing':
      return <Badge variant="secondary">Processing</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const PersonaList = ({ personas, onViewDetails }: PersonaListProps) => {
  if (personas.length === 0) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No AI personas found.</p>
          <p className="text-sm mt-1">Personas will appear here once employees create them.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table view */}
      <div className="hidden md:block">
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Employee</th>
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Last Updated</th>
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Consent Given</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((persona) => (
                  <tr key={persona.id} className="border-b border-border last:border-0 hover:bg-accent/5">
                    <td className="p-4">
                      <div className="font-medium">{persona.profile.full_name || 'Unknown'}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatWorkRole(persona.profile.work_role)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(persona.status)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(persona.updated_at), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {persona.consent_timestamp
                        ? format(new Date(persona.consent_timestamp), 'MMM d, yyyy')
                        : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(persona)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {personas.map((persona) => (
          <Card key={persona.id} className="shadow-soft border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{persona.profile.full_name || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatWorkRole(persona.profile.work_role)}
                  </div>
                </div>
                {getStatusBadge(persona.status)}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span>{format(new Date(persona.updated_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consent given:</span>
                  <span>
                    {persona.consent_timestamp
                      ? format(new Date(persona.consent_timestamp), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onViewDetails(persona)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
