"use client";

import { useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Recipe } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, "Recipe name must be at least 2 characters."),
  servings: z.coerce.number().min(1, "Servings must be at least 1."),
  ingredients: z.string().min(3, "Please add at least one ingredient. Enter one ingredient per line."),
});

interface RecipeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, servings: number, ingredients: string) => void;
  recipe: Recipe | null;
}

export function RecipeFormDialog({ open, onOpenChange, onSubmit, recipe }: RecipeFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      servings: 1,
      ingredients: "",
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        name: recipe.name,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`.trim()).join('\n'),
      });
    } else {
      form.reset({ name: '', servings: 1, ingredients: '' });
    }
  }, [recipe, open, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.name, values.servings, values.ingredients);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Edit Recipe' : 'Add a New Recipe'}</DialogTitle>
          <DialogDescription>
            {recipe ? 'Update the details for your recipe.' : 'Enter the name and ingredients for your new recipe.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pancakes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1 cup Flour&#10;2 large Eggs&#10;1/2 cup Milk"
                      className="h-40 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{recipe ? 'Save Changes' : 'Add Recipe'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
