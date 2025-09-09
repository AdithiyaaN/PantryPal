import { useState } from "react";
import { type Recipe } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Soup, Loader } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getNutritionalInfoAction } from "@/app/actions";
import { type GetNutritionalInfoOutput } from "@/ai/flows/get-nutritional-info";
import { NutritionTable } from "./NutritionTable";
import { useToast } from "@/hooks/use-toast";


interface RecipeItemProps {
  recipe: Recipe;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeItem({ recipe, isSelected, onToggleSelection, onEdit, onDelete }: RecipeItemProps) {
  const [nutrition, setNutrition] = useState<GetNutritionalInfoOutput | null>(null);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const { toast } = useToast();

  const handleGetNutrition = async () => {
    if (nutrition) { // Toggle off if already open
      setNutrition(null);
      return;
    }
    setIsLoadingNutrition(true);
    const result = await getNutritionalInfoAction(recipe.ingredients, recipe.servings);
    if (result.success && result.data) {
      setNutrition(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Nutrition Analysis Failed",
        description: result.error,
      });
    }
    setIsLoadingNutrition(false);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={recipe.id} className="border-b-0">
          <div className="flex items-start p-4">
            <div className="flex items-center pt-1">
              <Checkbox
                id={`recipe-${recipe.id}`}
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(recipe.id)}
                className="mr-4 h-5 w-5"
                aria-label={`Select ${recipe.name}`}
              />
            </div>
            <div className="flex-1">
              <AccordionTrigger className="flex-1 p-0 text-left hover:no-underline justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base text-left">{recipe.name}</span>
                    <span className="text-sm text-muted-foreground font-normal">{recipe.ingredients.length} ingredients | {recipe.servings} servings</span>
                  </div>
              </AccordionTrigger>
            </div>
            <div className="flex items-center gap-1 ml-4 pt-1">
              <Button variant="ghost" size="icon" onClick={handleGetNutrition} aria-label={`Get nutrition for ${recipe.name}`} disabled={isLoadingNutrition}>
                {isLoadingNutrition ? <Loader className="h-4 w-4 animate-spin" /> : <Soup className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(recipe)} aria-label={`Edit ${recipe.name}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(recipe.id)} aria-label={`Delete ${recipe.name}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <AccordionContent>
            <div className="px-4 pb-4 pl-12 -mt-2">
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()}</li>
                ))}
              </ul>
              {nutrition && <NutritionTable nutritionData={nutrition} />}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
