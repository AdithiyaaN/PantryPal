import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The numeric quantity of the ingredient. Should be a number, e.g., 0.5, 1, 2.'),
  unit: z.string().describe('The unit of measurement for the ingredient (e.g., "cup", "g", "tbsp", "clove"). Can be an empty string if there is no unit.'),
});
