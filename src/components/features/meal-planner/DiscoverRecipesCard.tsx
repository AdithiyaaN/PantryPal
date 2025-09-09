"use client";

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getRecommendedDishesAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Plus } from 'lucide-react';
import { type RecommendDishesOutput } from '@/ai/flows/recommend-dishes';
import { type Ingredient } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Discovering...' : <><Sparkles className="mr-2 h-4 w-4" /> Discover Recipes</>}
    </Button>
  );
}

interface DiscoverRecipesCardProps {
  onAddRecipe: (name: string, servings: number, ingredients: Ingredient[]) => void;
}

export function DiscoverRecipesCard({ onAddRecipe }: DiscoverRecipesCardProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [recommendations, setRecommendations] = useState<RecommendDishesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDiscover(formData: FormData) {
    setIsLoading(true);
    setRecommendations(null);
    const result = await getRecommendedDishesAction(formData);
    if (result.success && result.data) {
      setRecommendations(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Discovery Failed",
        description: result.error,
      });
    }
    setIsLoading(false);
  }

  const handleAddRecipeClick = (rec: RecommendDishesOutput['recommendations'][0]) => {
     const ingredients: Ingredient[] = rec.ingredients.map(line => {
      const parts = line.trim().split(' ');
      const quantityMatch = parts[0].match(/^[0-9./]+/);
      let quantity = 1;
      let unit = '';
      let ingredientName = line.trim();

      if (quantityMatch) {
        try {
          if (quantityMatch[0].includes('/')) {
            const [num, den] = quantityMatch[0].split('/');
            quantity = parseInt(num, 10) / parseInt(den, 10);
          } else {
            quantity = parseFloat(quantityMatch[0]);
          }
          
          if (parts.length > 1 && isNaN(parseFloat(parts[1]))) {
             unit = parts[1];
             ingredientName = parts.slice(2).join(' ');
          } else {
             ingredientName = parts.slice(1).join(' ');
          }
        } catch (e) {
            quantity = 1;
            unit = '';
            ingredientName = line.trim();
        }
      }
      return { name: ingredientName, quantity, unit };
    });
    
    // Quick guess for servings, could be improved.
    const servings = rec.name.toLowerCase().includes('for one') ? 1 : 2;

    onAddRecipe(rec.name, servings, ingredients);
    toast({
      title: 'Recipe Added!',
      description: `"${rec.name}" has been added to your recipe book.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover Recipes</CardTitle>
        <CardDescription>Tell the AI what you have, and get recipe ideas!</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleDiscover} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredients">Available Ingredients</Label>
            <Input id="ingredients" name="ingredients" placeholder="e.g., chicken, rice, broccoli" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Any specific requests?</Label>
            <Input id="prompt" name="prompt" placeholder="e.g., vegetarian, quick and easy" />
          </div>
          <SubmitButton />
        </form>
         {(isLoading || recommendations) && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Suggestions</h3>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recommendations && recommendations.recommendations.length > 0 ? (
               <ScrollArea className="h-96 pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {recommendations.recommendations.map((rec, i) => (
                    <AccordionItem value={`item-${i}`} key={i}>
                      <AccordionTrigger>{rec.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                           <Button size="sm" variant="outline" onClick={() => handleAddRecipeClick(rec)}><Plus className="mr-2 h-4 w-4" /> Add to My Recipes</Button>
                          <div>
                            <h4 className="font-semibold mb-2">Ingredients</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {rec.ingredients.map((ing, j) => <li key={j}>{ing}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Instructions</h4>
                            <ol className="list-decimal pl-5 text-sm space-y-1">
                              {rec.instructions.map((step, k) => <li key={k}>{step}</li>)}
                            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recommendations found. Try adding more ingredients!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
