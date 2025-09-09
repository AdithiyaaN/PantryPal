"use client";

import { useState, useEffect, useCallback, useId } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { type Recipe, type Ingredient } from '@/types';
import { ImportRecipeCard } from './ImportRecipeCard';
import { RecipeList } from './RecipeList';
import { ShoppingListCard } from './ShoppingListCard';
import { RecipeFormDialog } from './RecipeFormDialog';
import { useToast } from '@/hooks/use-toast';
import { type CategorizeIngredientsOutput } from '@/ai/flows/categorize-ingredients';
import { getCategorizedShoppingListAction } from '@/app/actions';

export function MealPlanner() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', []);
  const [shoppingList, setShoppingList] = useLocalStorage<string[]>('shoppingList', []);
  const [categorizedList, setCategorizedList] = useLocalStorage<CategorizeIngredientsOutput | null>('categorizedShoppingList', null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  const generateUniqueId = () => `recipe-${Date.now()}-${Math.random()}`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCategorizeList = useCallback(async (ingredients: string[]) => {
    setIsCategorizing(true);
    const result = await getCategorizedShoppingListAction(ingredients);
    if (result.success && result.data) {
      setCategorizedList(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "AI Categorization Failed",
        description: result.error,
      });
      // Fallback to uncategorized list
      setCategorizedList({ categories: [{ category: 'Uncategorized', items: ingredients }] });
    }
    setIsCategorizing(false);
  }, [setCategorizedList, toast]);

  useEffect(() => {
    if (shoppingList.length > 0) {
      handleCategorizeList(shoppingList);
    } else {
      setCategorizedList(null);
    }
  }, [shoppingList, handleCategorizeList]);

  const handleAddOrUpdateRecipe = (name: string, servings: number, ingredientsStr: string) => {
    const ingredients: Ingredient[] = ingredientsStr.split('\n').map(line => {
        const parts = line.trim().split(' ');
        const quantity = parseFloat(parts[0]) || 1;
        const unit = !isNaN(parseFloat(parts[0])) ? parts[1] || '' : '';
        const name = !isNaN(parseFloat(parts[0])) ? parts.slice(2).join(' ') : line.trim();
        return { name, quantity, unit };
      }).filter(ing => ing.name !== '');

    if (editingRecipe) {
      const updatedRecipe = { ...editingRecipe, name, servings, ingredients };
      setRecipes(prev => prev.map(r => (r.id === editingRecipe.id ? updatedRecipe : r)));
      toast({ title: "Recipe updated!" });
    } else {
      const newRecipe: Recipe = {
        id: generateUniqueId(),
        name,
        servings,
        ingredients,
      };
      setRecipes(prev => [...prev, newRecipe]);
      toast({ title: "Recipe added!" });
    }
    setEditingRecipe(null);
  };
  
  const handleImportedRecipe = (name: string, servings: number, ingredients: Ingredient[]) => {
    const newRecipe: Recipe = {
      id: generateUniqueId(),
      name,
      servings,
      ingredients,
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setSelectedRecipeIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast({ title: "Recipe deleted.", variant: 'destructive' });
  };
  
  const handleToggleRecipeSelection = (id: string) => {
    setSelectedRecipeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleGenerateShoppingList = () => {
    const ingredientsFromSelectedRecipes = recipes
      .filter(r => selectedRecipeIds.has(r.id))
      .flatMap(r => r.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`.trim()));

    setShoppingList(prevList => {
      const combinedList = [...prevList, ...ingredientsFromSelectedRecipes];
      const uniqueList = Array.from(new Set(combinedList.map(item => item.toLowerCase().trim()).filter(Boolean)));
      return uniqueList.sort((a, b) => a.localeCompare(b));
    });

    toast({ title: "Shopping list updated!", description: `${ingredientsFromSelectedRecipes.length} ingredients considered.` });
    setSelectedRecipeIds(new Set());
  };

  const handleClearShoppingList = () => {
    setShoppingList([]);
    setCategorizedList(null);
    toast({ title: "Shopping list cleared." });
  };

  const handleOpenForm = (recipe: Recipe | null) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ImportRecipeCard onRecipeImported={handleImportedRecipe} />
          <RecipeList
            recipes={recipes}
            selectedRecipeIds={selectedRecipeIds}
            onToggleSelection={handleToggleRecipeSelection}
            onEdit={(recipe) => handleOpenForm(recipe)}
            onDelete={handleDeleteRecipe}
            onAddNew={() => handleOpenForm(null)}
            onGenerate={handleGenerateShoppingList}
          />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <ShoppingListCard 
            list={shoppingList} 
            categorizedList={categorizedList}
            isCategorizing={isCategorizing}
            onClear={handleClearShoppingList} 
          />
        </div>
      </div>
      <RecipeFormDialog
        key={editingRecipe?.id ?? 'new'}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddOrUpdateRecipe}
        recipe={editingRecipe}
      />
    </div>
  );
}
