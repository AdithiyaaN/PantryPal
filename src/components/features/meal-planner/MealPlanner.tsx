"use client";

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { type Recipe, type Ingredient } from '@/types';
import { ImportRecipeCard } from './ImportRecipeCard';
import { RecipeList } from './RecipeList';
import { ShoppingListCard } from './ShoppingListCard';
import { RecipeFormDialog } from './RecipeFormDialog';
import { useToast } from '@/hooks/use-toast';
import { type CategorizeIngredientsOutput } from '@/ai/flows/categorize-ingredients';
import { getCategorizedShoppingListAction } from '@/app/actions';
import { DiscoverRecipesCard } from './DiscoverRecipesCard';


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
    const ingredients: Ingredient[] = ingredientsStr.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.trim().split(' ');
      const quantityMatch = parts[0].match(/^[0-9./]+/);
      let quantity = 1;
      let unit = '';
      let ingredientName = line.trim();

      if (quantityMatch) {
        try {
          // Handles fractions like 1/2
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
            // if parsing fails, fall back to default
            quantity = 1;
            unit = '';
            ingredientName = line.trim();
        }
      }

      return { name: ingredientName, quantity, unit };
    });

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
      const combinedList = [...new Set([...prevList, ...ingredientsFromSelectedRecipes])];
       // Use a Map to keep track of unique items, preserving original casing for the first-seen item.
      const uniqueMap = new Map();
      combinedList.forEach(item => {
        const lowerCaseItem = item.toLowerCase().trim();
        if (lowerCaseItem && !uniqueMap.has(lowerCaseItem)) {
          uniqueMap.set(lowerCaseItem, item.trim());
        }
      });
      const uniqueList = Array.from(uniqueMap.values());
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImportRecipeCard onRecipeImported={handleImportedRecipe} />
            <DiscoverRecipesCard onAddRecipe={handleImportedRecipe} />
          </div>
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
