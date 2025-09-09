"use client";

import { type GetNutritionalInfoOutput } from "@/ai/flows/get-nutritional-info";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NutritionTableProps {
  nutritionData: GetNutritionalInfoOutput;
}

export function NutritionTable({ nutritionData }: NutritionTableProps) {
  if (!nutritionData.nutritionPerServing.length) {
    return null;
  }
  
  return (
    <Card className="mt-4 bg-muted/30">
        <CardHeader>
            <CardTitle className="text-lg">Nutritional Information</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="per-serving">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="per-serving">Per Serving</TabsTrigger>
                    <TabsTrigger value="total">Total Recipe</TabsTrigger>
                </TabsList>
                <TabsContent value="per-serving">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">% Daily Value</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {nutritionData.nutritionPerServing.map((item) => (
                            <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.amount.toFixed(1)} {item.unit}</TableCell>
                            <TableCell className="text-right">{item.percentOfDailyNeeds ? `${item.percentOfDailyNeeds.toFixed(0)}%` : '-'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="total">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {nutritionData.totalNutrition.map((item) => (
                            <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.amount.toFixed(1)} {item.unit}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
      </CardContent>
    </Card>
  );
}
