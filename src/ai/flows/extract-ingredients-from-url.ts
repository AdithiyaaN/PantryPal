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

const ExtractIngredientsFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage containing the recipe.'),
});
export type ExtractIngredientsFromUrlInput = z.infer<typeof ExtractIngredientsFromUrlInputSchema>;

const ExtractIngredientsFromUrlOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients extracted from the URL.'),
});
export type ExtractIngredientsFromUrlOutput = z.infer<typeof ExtractIngredientsFromUrlOutputSchema>;

export async function extractIngredientsFromUrl(input: ExtractIngredientsFromUrlInput): Promise<ExtractIngredientsFromUrlOutput> {
  return extractIngredientsFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIngredientsFromUrlPrompt',
  input: {schema: ExtractIngredientsFromUrlInputSchema},
  output: {schema: ExtractIngredientsFromUrlOutputSchema},
  prompt: `You are a recipe parsing expert. Extract the ingredients from the following URL: {{{url}}}.\n\nReturn the ingredients as a list of strings.`,
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
