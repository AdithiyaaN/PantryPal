'use server';
/**
 * @fileOverview Recommends dishes based on available ingredients.
 *
 * - recommendDishes - A function that takes ingredients and returns recipe recommendations.
 * - RecommendDishesInput - The input type for the recommendDishes function.
 * - RecommendDishesOutput - The return type for the recommendDishes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendDishesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients the user has.'),
  prompt: z.string().optional().describe('An optional user prompt with more specific requests (e.g., "vegetarian", "quick and easy").'),
});
export type RecommendDishesInput = z.infer<typeof RecommendDishesInputSchema>;

const RecommendedRecipeSchema = z.object({
  name: z.string().describe('The name of the recommended dish.'),
  description: z.string().describe('A brief, enticing description of the dish.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('A list of step-by-step instructions to prepare the dish.'),
});

const RecommendDishesOutputSchema = z.object({
  recommendations: z.array(RecommendedRecipeSchema).describe('An array of 3-5 recipe recommendations.'),
});
export type RecommendDishesOutput = z.infer<typeof RecommendDishesOutputSchema>;

export async function recommendDishes(input: RecommendDishesInput): Promise<RecommendDishesOutput> {
  return recommendDishesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendDishesPrompt',
  input: {schema: RecommendDishesInputSchema},
  output: {schema: RecommendDishesOutputSchema},
  prompt: `You are a creative chef who excels at making delicious meals from limited ingredients.

Based on the ingredients provided, suggest 3 to 5 recipes. For each recipe, provide a name, a short description, a list of ingredients, and the cooking instructions.

Available ingredients:
{{#each ingredients}}
- {{{this}}}
{{/each}}

{{#if prompt}}
User's request: {{{prompt}}}
{{/if}}

Prioritize recipes that heavily use the provided ingredients. You can include a few common pantry staples (like oil, salt, pepper, flour) in the ingredients list even if they were not provided.
`,
});

const recommendDishesFlow = ai.defineFlow(
  {
    name: 'recommendDishesFlow',
    inputSchema: RecommendDishesInputSchema,
    outputSchema: RecommendDishesOutputSchema,
  },
  async input => {
    if (input.ingredients.length === 0) {
      return { recommendations: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
