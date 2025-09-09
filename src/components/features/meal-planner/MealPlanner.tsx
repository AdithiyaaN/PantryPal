"use client";

import { useState, useEffect, useId, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { type Recipe } from '@/types';
import { ImportRecipeCard } from './ImportRecipeCard';
import { RecipeList } from './RecipeList';
import { ShoppingListCard } from './ShoppingListCard';
import { RecipeFormDialog } from './RecipeFormDialog';
import { useToast } from '@/hooks/use-toast';
import { type CategorizeIngredientsOutput } from '@/ai/flows/categorize-ingredients';
import { getCategorizedShoppingListAction, generateRecipeImageAction } from '@/app/actions';

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
  const uuid = useId();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateImage = useCallback(async (recipeId: string, recipeName: string) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isGeneratingImage: true } : r));
    const result = await generateRecipeImageAction(recipeName);
    if (result.success && result.data) {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, imageUrl: result.data!.imageUrl, isGeneratingImage: false } : r));
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isGeneratingImage: false } : r));
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: result.error,
      });
    }
  }, [setRecipes, toast]);

  useEffect(() => {
    if (shoppingList.length > 0) {
      handleCategorizeList(shoppingList);
    } else {
      setCategorizedList(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingList]);

  const handleCategorizeList = async (ingredients: string[]) => {
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
  };

  const handleAddOrUpdateRecipe = (name: string, ingredientsStr: string) => {
    const ingredients = ingredientsStr.split('\n').map(ing => ing.trim()).filter(ing => ing !== '');
    if (editingRecipe) {
      const updatedRecipe = { ...editingRecipe, name, ingredients };
      setRecipes(prev => prev.map(r => (r.id === editingRecipe.id ? updatedRecipe : r)));
      toast({ title: "Recipe updated!" });
      // Optional: Regenerate image if name changed
      if (editingRecipe.name !== name) {
        handleGenerateImage(editingRecipe.id, name);
      }
    } else {
      const newRecipe: Recipe = {
        id: `recipe-${uuid}-${Date.now()}`,
        name,
        ingredients,
        isGeneratingImage: true,
      };
      setRecipes(prev => [...prev, newRecipe]);
      toast({ title: "Recipe added!" });
      handleGenerateImage(newRecipe.id, newRecipe.name);
    }
    setEditingRecipe(null);
  };
  
  const handleImportedRecipe = (name: string, ingredients: string[]) => {
    const newRecipe: Recipe = {
      id: `recipe-${uuid}-${Date.now()}`,
      name,
      ingredients,
      isGeneratingImage: true,
    };
    setRecipes(prev => [...prev, newRecipe]);
    handleGenerateImage(newRecipe.id, newRecipe.name);
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
    const ingredientsToAdd = recipes
      .filter(r => selectedRecipeIds.has(r.id))
      .flatMap(r => r.ingredients);
    
    setShoppingList(prevList => {
      const combined = [...prevList, ...ingredientsToAdd];
      const unique = Array.from(new Set(combined.map(i => i.trim().toLowerCase()).filter(Boolean)));
      return unique.sort((a, b) => a.localeCompare(b));
    });

    toast({ title: "Shopping list updated!", description: `${ingredientsToAdd.length} ingredients considered.` });
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
