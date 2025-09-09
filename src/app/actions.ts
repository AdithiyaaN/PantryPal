"use server";

import { extractIngredientsFromUrl } from "@/ai/flows/extract-ingredients-from-url";

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
