export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  imageUrl?: string;
  isGeneratingImage?: boolean;
}
