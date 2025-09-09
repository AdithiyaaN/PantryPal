import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeItem } from "./RecipeItem";
import { type Recipe } from "@/types";
import { Plus, ShoppingCart } from "lucide-react";
import Image from 'next/image';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipeIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onGenerate: () => void;
}

export function RecipeList({ recipes, selectedRecipeIds, onToggleSelection, onEdit, onDelete, onAddNew, onGenerate }: RecipeListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>My Recipes</CardTitle>
            <CardDescription>Manage your recipes and generate shopping lists.</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onAddNew} variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Manually</Button>
            <Button 
              onClick={onGenerate} 
              disabled={selectedRecipeIds.size === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generate List ({selectedRecipeIds.size})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <div className="space-y-4">
            {recipes.map(recipe => (
              <RecipeItem 
                key={recipe.id} 
                recipe={recipe} 
                isSelected={selectedRecipeIds.has(recipe.id)}
                onToggleSelection={onToggleSelection}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
             <div className="flex justify-center mb-4">
                <Image src="https://picsum.photos/300/200" alt="Cooking illustration" data-ai-hint="cooking empty state" width="300" height="200" className="rounded-lg opacity-70" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your recipe book is empty</h3>
            <p className="text-sm">Add a recipe manually or use the Magic Import to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
