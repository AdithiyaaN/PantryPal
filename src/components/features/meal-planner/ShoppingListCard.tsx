"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, ShoppingBag, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type CategorizeIngredientsOutput } from "@/ai/flows/categorize-ingredients";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface ShoppingListCardProps {
  list: string[];
  categorizedList: CategorizeIngredientsOutput | null;
  isCategorizing: boolean;
  onClear: () => void;
}

export function ShoppingListCard({ list, categorizedList, isCategorizing, onClear }: ShoppingListCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (navigator.clipboard) {
      let textToCopy = '';
      if (categorizedList) {
        textToCopy = categorizedList.categories.map(cat => 
          `[${cat.category}]\n${cat.items.join('\n')}`
        ).join('\n\n');
      } else {
        textToCopy = list.join('\n');
      }
      navigator.clipboard.writeText(textToCopy);
      toast({ title: "Shopping list copied to clipboard!" });
    } else {
      toast({ variant: 'destructive', title: "Copy failed", description: "Clipboard not available." });
    }
  };

  const renderContent = () => {
    if (isCategorizing) {
      return (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-1/2" />
          <div className="pl-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          <Skeleton className="h-8 w-1/2" />
           <div className="pl-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      );
    }
    
    if (!categorizedList || categorizedList.categories.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your list is empty</h3>
          <p className="text-sm">Select recipes and click "Generate List" to get started.</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-96 pr-4">
        <Accordion type="multiple" defaultValue={categorizedList.categories.map(c => c.category)} className="w-full">
          {categorizedList.categories.map((cat) => (
            <AccordionItem value={cat.category} key={cat.category}>
              <AccordionTrigger className="text-base font-medium capitalize">{cat.category}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-2">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-center text-sm p-2 bg-muted/50 rounded-md">
                      <ShoppingBag className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    );
  };
  
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <CardTitle>Shopping List</CardTitle>
             {isCategorizing && <Loader className="h-5 w-5 animate-spin" />}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={list.length === 0} aria-label="Copy list">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClear} disabled={list.length === 0} aria-label="Clear list">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <CardDescription>Your AI-categorized ingredient list.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}
