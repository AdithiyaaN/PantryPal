'use server';
/**
 * @fileOverview Categorizes a list of ingredients using AI.
 *
 * - categorizeIngredients - A function that takes a list of ingredients and returns them categorized.
 * - CategorizeIngredientsInput - The input type for the categorizeIngredients function.
 * - CategorizeIngredientsOutput - The return type for the categorizeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to categorize.'),
});
export type CategorizeIngredientsInput = z.infer<typeof CategorizeIngredientsInputSchema>;

const CategorizeIngredientsOutputSchema = z.object({
  categories: z.array(z.object({
    category: z.string().describe('The name of the grocery store category (e.g., "Produce", "Dairy & Cheese").'),
    items: z.array(z.string()).describe('The ingredients belonging to this category.'),
  })).describe('An array of categories, each with a list of ingredients.'),
});
export type CategorizeIngredientsOutput = z.infer<typeof CategorizeIngredientsOutputSchema>;

export async function categorizeIngredients(input: CategorizeIngredientsInput): Promise<CategorizeIngredientsOutput> {
  return categorizeIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeIngredientsPrompt',
  input: {schema: CategorizeIngredientsInputSchema},
  output: {schema: CategorizeIngredientsOutputSchema},
  prompt: `You are an expert grocery list organizer. Take the following list of ingredients and categorize them into common grocery store aisles.

Ingredients:
{{#each ingredients}}
- {{{this}}}
{{/each}}

Group the ingredients into logical categories. Do not create a category for a single item if it can fit into a broader existing category.`,
});

const categorizeIngredientsFlow = ai.defineFlow(
  {
    name: 'categorizeIngredientsFlow',
    inputSchema: CategorizeIngredientsInputSchema,
    outputSchema: CategorizeIngredientsOutputSchema,
  },
  async input => {
    if (input.ingredients.length === 0) {
      return { categories: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
