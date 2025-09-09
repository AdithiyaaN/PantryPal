'use server';
/**
 * @fileOverview Extracts ingredients from a recipe URL using AI.
 *
 * - extractIngredientsFromUrl - A function that takes a URL and returns a list of ingredients.
 * - ExtractIngredientsFromUrlInput - The input type for the extractIngredientsFromUrl function.
 * - ExtractIngredientsFromUrlOutput - The return type for the extractIngredientsFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { IngredientSchema } from '@/types/zod';


const ExtractIngredientsFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage containing the recipe.'),
});
export type ExtractIngredientsFromUrlInput = z.infer<typeof ExtractIngredientsFromUrlInputSchema>;

const ExtractIngredientsFromUrlOutputSchema = z.object({
  servings: z.number().optional().describe('The number of servings the recipe makes.'),
  ingredients: z.array(IngredientSchema).describe('A list of ingredients extracted from the URL, with quantities and units.'),
});
export type ExtractIngredientsFromUrlOutput = z.infer<typeof ExtractIngredientsFromUrlOutputSchema>;

export async function extractIngredientsFromUrl(input: ExtractIngredientsFromUrlInput): Promise<ExtractIngredientsFromUrlOutput> {
  return extractIngredientsFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIngredientsFromUrlPrompt',
  input: {schema: ExtractIngredientsFromUrlInputSchema},
  output: {schema: ExtractIngredientsFromUrlOutputSchema},
  prompt: `You are a recipe parsing expert. Extract the ingredients from the following URL: {{{url}}}.

Parse each ingredient into its name, quantity, and unit. Also extract the serving size for the recipe if available.
If an ingredient has a quantity like "a pinch" or "to taste", use a quantity of 1 and a unit of "pinch" or "to taste".
If an ingredient is listed without a quantity (e.g., "salt"), use a quantity of 1 and an empty string for the unit.`,
});

const extractIngredientsFromUrlFlow = ai.defineFlow(
  {
    name: 'extractIngredientsFromUrlFlow',
    inputSchema: ExtractIngredientsFromUrlInputSchema,
    outputSchema: ExtractIngredientsFromUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
