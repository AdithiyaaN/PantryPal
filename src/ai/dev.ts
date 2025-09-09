'use server';

import {config} from 'dotenv';
config();

import '@/ai/flows/extract-ingredients-from-url.ts';
import '@/ai/flows/categorize-ingredients.ts';
import '@/ai/flows/get-nutritional-info.ts';
import '@/ai/flows/recommend-dishes.ts';
