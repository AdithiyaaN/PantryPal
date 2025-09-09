"use server";

import { extractIngredientsFromUrl } from "@/ai/flows/extract-ingredients-from-url";
import { categorizeIngredients, CategorizeIngredientsOutput } from "@/ai/flows/categorize-ingredients";
import { generateRecipeImage, GenerateRecipeImageOutput } from "@/ai/flows/generate-recipe-image";

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
      return { success: true, data: { name, ingredients: result.ingredients } };
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

export async function generateRecipeImageAction(recipeName: string): Promise<{success: boolean, data?: GenerateRecipeImageOutput, error?: string}> {
  if (!recipeName) {
    return { success: false, error: "Recipe name is required." };
  }

  try {
    const result = await generateRecipeImage({ recipeName });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to generate recipe image. Please try again.",
    };
  }
}
