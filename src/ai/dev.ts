import { config } from 'dotenv';
config();

import '@/ai/flows/extract-ingredients-from-url.ts';
import '@/ai/flows/categorize-ingredients.ts';
import '@/ai/flows/generate-recipe-image.ts';
