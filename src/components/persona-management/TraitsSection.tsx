import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { PersonaTrait, addPersonaTrait, deletePersonaTrait } from '@/lib/personaApi';
import { useToast } from '@/hooks/use-toast';

interface TraitsSectionProps {
  personaId: string;
  traits: PersonaTrait[];
  onTraitsChange: () => void;
}

const TRAIT_CATEGORIES = [
  'Communication style',
  'Stress response',
  'Feedback preference',
  'Work style',
  'Team dynamics',
  'Other'
];

export const TraitsSection = ({ personaId, traits, onTraitsChange }: TraitsSectionProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTrait, setNewTrait] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const handleAddTrait = async () => {
    if (!newTrait.trim()) {
      toast({
        title: "Trait required",
        description: "Please enter a trait description.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPersonaTrait(personaId, {
        trait: newTrait,
        category: newCategory || undefined,
      });
      
      toast({
        title: "Trait added",
        description: "The persona trait has been added successfully.",
      });
      
      setNewTrait('');
      setNewCategory('');
      setIsAdding(false);
      onTraitsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trait. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrait = async (traitId: string) => {
    try {
      await deletePersonaTrait(personaId, traitId);
      
      toast({
        title: "Trait removed",
        description: "The persona trait has been removed.",
      });
      
      onTraitsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove trait. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Traits</CardTitle>
            <CardDescription>
              Add traits to refine how this persona communicates in simulations
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add trait
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trait">Trait description</Label>
              <Input
                id="trait"
                placeholder="e.g., Very direct, Prefers written communication"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {TRAIT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTrait}>Add trait</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTrait('');
                  setNewCategory('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {traits.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No traits added yet</p>
            <p className="text-xs mt-1">Add traits to help refine this persona's behavior</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {traits.map((trait) => (
              <Badge
                key={trait.id}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 gap-2"
              >
                <div className="space-y-0.5">
                  <div>{trait.trait}</div>
                  {trait.category && (
                    <div className="text-xs opacity-70">{trait.category}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTrait(trait.id)}
                  className="ml-1 hover:bg-background/50 rounded-sm p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
