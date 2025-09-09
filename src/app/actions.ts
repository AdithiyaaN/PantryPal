"use server";

import { extractIngredientsFromUrl } from "@/ai/flows/extract-ingredients-from-url";
import { categorizeIngredients, CategorizeIngredientsOutput } from "@/ai/flows/categorize-ingredients";
import { getNutritionalInfo, GetNutritionalInfoOutput } from "@/ai/flows/get-nutritional-info";
import { recommendDishes, RecommendDishesOutput } from "@/ai/flows/recommend-dishes";
import { type Ingredient } from "@/types";


export async function getIngredientsFromUrlAction(formData: FormData) {
  const url = formData.get("url") as string;
  const name = formData.get("name") as string;

  if (!url || !name) {
    return { success: false, error: "URL and recipe name are required." };
  }

  try {
    // Basic URL validation
    new URL(url);
  } catch (_) {
    return { success: false, error: "Please enter a valid URL." };
  }

  try {
    const result = await extractIngredientsFromUrl({ url });
    if (result.ingredients && result.ingredients.length > 0) {
      return { success: true, data: { name, servings: result.servings ?? 1, ingredients: result.ingredients } };
    }
    return { success: false, error: "Could not find any ingredients at that URL." };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        "Failed to extract ingredients. The URL might be invalid or the page structure unsupported.",
    };
  }
}

export async function getCategorizedShoppingListAction(ingredients: string[]): Promise<{success: boolean, data?: CategorizeIngredientsOutput, error?: string}> {
  if (!ingredients || ingredients.length === 0) {
    return { success: true, data: { categories: [] } };
  }

  try {
    const result = await categorizeIngredients({ ingredients });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to categorize shopping list. Please try again.",
    };
  }
}

export async function getNutritionalInfoAction(ingredients: Ingredient[], servings: number): Promise<{success: boolean, data?: GetNutritionalInfoOutput, error?: string}> {
  if (!ingredients || ingredients.length === 0) {
    return { success: true, data: { totalNutrition: [], nutritionPerServing: [] } };
  }

  try {
    const result = await getNutritionalInfo({ ingredients, servings });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to get nutritional information. Please try again.",
    };
  }
}

export async function getRecommendedDishesAction(formData: FormData): Promise<{success: boolean, data?: RecommendDishesOutput, error?: string}> {
  const ingredientsStr = formData.get("ingredients") as string;
  const prompt = formData.get("prompt") as string;
  
  if (!ingredientsStr) {
    return { success: false, error: "Please enter at least one ingredient." };
  }

  const ingredients = ingredientsStr.split(',').map(i => i.trim()).filter(i => i);

  try {
    const result = await recommendDishes({ ingredients, prompt });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to get recipe recommendations. Please try again.",
    };
  }
}
