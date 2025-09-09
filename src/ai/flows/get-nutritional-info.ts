'use server';
/**
 * @fileOverview Analyzes a list of ingredients to provide a nutritional breakdown.
 *
 * - getNutritionalInfo - A function that takes ingredients and returns nutritional data.
 * - GetNutritionalInfoInput - The input type for the getNutritionalInfo function.
 * - GetNutritionalInfoOutput - The return type for the getNutritionalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { IngredientSchema } from '@/types/zod';

const GetNutritionalInfoInputSchema = z.object({
  ingredients: z.array(IngredientSchema).describe('A list of ingredients with quantities and units.'),
  servings: z.number().describe('The number of servings the recipe makes.'),
});
export type GetNutritionalInfoInput = z.infer<typeof GetNutritionalInfoInputSchema>;

const NutritionItemSchema = z.object({
  name: z.string().describe('The name of the nutrient (e.g., "Calories", "Protein", "Vitamin C").'),
  amount: z.number().describe('The amount of the nutrient.'),
  unit: z.string().describe('The unit of measurement for the nutrient (e.g., "g", "mg", "kcal").'),
  percentOfDailyNeeds: z.number().optional().describe('The percentage of the recommended daily value for this nutrient.'),
});

const GetNutritionalInfoOutputSchema = z.object({
  totalNutrition: z.array(NutritionItemSchema).describe('The nutritional information for the entire recipe.'),
  nutritionPerServing: z.array(NutritionItemSchema).describe('The nutritional information per serving.'),
});
export type GetNutritionalInfoOutput = z.infer<typeof GetNutritionalInfoOutputSchema>;

export async function getNutritionalInfo(input: GetNutritionalInfoInput): Promise<GetNutritionalInfoOutput> {
  return getNutritionalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNutritionalInfoPrompt',
  input: {schema: GetNutritionalInfoInputSchema},
  output: {schema: GetNutritionalInfoOutputSchema},
  prompt: `You are an expert nutritionist. Analyze the following list of ingredients for a recipe that makes {{servings}} servings.

Provide a detailed nutritional breakdown for the *entire recipe* and for a *single serving*.

Include major nutrients like Calories, Protein, Fat (Saturated, Trans), Carbohydrates, Fiber, and Sugar.
Also include a breakdown of major vitamins and minerals (e.g., Vitamin A, C, D, E, K, B-vitamins, Calcium, Iron, Magnesium, Potassium, Sodium, Zinc).

Ingredients:
{{#each ingredients}}
- {{quantity}} {{unit}} {{{name}}}
{{/each}}

Calculate the total nutrition for all ingredients combined, and then divide by the number of servings to get the per-serving nutrition. Provide percentages of daily needs where applicable, based on a 2000-calorie diet.
`,
});

const getNutritionalInfoFlow = ai.defineFlow(
  {
    name: 'getNutritionalInfoFlow',
    inputSchema: GetNutritionalInfoInputSchema,
    outputSchema: GetNutritionalInfoOutputSchema,
  },
  async input => {
    if (input.ingredients.length === 0) {
      return { totalNutrition: [], nutritionPerServing: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
