"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListCardProps {
  list: string[];
  onClear: () => void;
}

export function ShoppingListCard({ list, onClear }: ShoppingListCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(list.join('\n'));
      toast({ title: "Shopping list copied to clipboard!" });
    } else {
      toast({ variant: 'destructive', title: "Copy failed", description: "Clipboard not available." });
    }
  };
  
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Shopping List</CardTitle>
            <CardDescription>Your consolidated ingredient list.</CardDescription>
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
      </CardHeader>
      <CardContent>
        {list.length > 0 ? (
          <ScrollArea className="h-96 pr-4">
            <ul className="space-y-2">
              {list.map((item, i) => (
                <li key={i} className="flex items-center text-sm p-2 bg-muted/50 rounded-md">
                  <ShoppingBag className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                  <span className="capitalize">{item}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Your list is empty</h3>
            <p className="text-sm">Select recipes and click "Generate List" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
