"use client";

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getIngredientsFromUrlAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import { type Ingredient } from '@/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? 'Importing...' : <><Download className="mr-2 h-4 w-4" /> Import Recipe</>}
    </Button>
  );
}

interface ImportRecipeCardProps {
  onRecipeImported: (name: string, servings: number, ingredients: Ingredient[]) => void;
}

export function ImportRecipeCard({ onRecipeImported }: ImportRecipeCardProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleImport(formData: FormData) {
    const result = await getIngredientsFromUrlAction(formData);
    if (result.success && result.data) {
      onRecipeImported(result.data.name, result.data.servings, result.data.ingredients);
      toast({
        title: "Success!",
        description: `Recipe "${result.data.name}" imported.`,
      });
      formRef.current?.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: result.error,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import a Recipe</CardTitle>
        <CardDescription>Enter a URL to magically import a recipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleImport} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input id="name" name="name" placeholder="e.g., Chocolate Chip Cookies" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Recipe URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://example.com/recipe" required />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
