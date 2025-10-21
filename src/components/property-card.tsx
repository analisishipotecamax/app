
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Home, PiggyBank, HandCoins, Percent, Star } from "lucide-react";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface PropertyCardProps {
  property: Property;
  onRemove: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  meetsSpecialConditions: boolean;
}

export default function PropertyCard({ property, onRemove, onToggleFavorite, meetsSpecialConditions }: PropertyCardProps) {
  return (
    <Card className={cn("relative group transition-all", property.isFavorite && "border-2 border-green-500 bg-green-50 dark:bg-green-950/30")}>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 opacity-50 hover:opacity-100", property.isFavorite ? "text-yellow-500 opacity-100" : "text-muted-foreground")}
          onClick={() => onToggleFavorite(property.id)}
        >
          <Star className={cn("h-5 w-5", property.isFavorite && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-50 hover:opacity-100"
          onClick={() => onRemove(property.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="truncate pr-20">{property.name}</CardTitle>
        <CardDescription>{currencyFormatter.format(property.price)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>Financiación ({meetsSpecialConditions ? '95%' : '90%'})</span>
          </div>
          <span className="font-semibold">{currencyFormatter.format(property.financingAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-muted-foreground">
            <PiggyBank className="h-4 w-4" />
            <span>Fondos Necesarios</span>
          </div>
          <span className="font-semibold">{currencyFormatter.format(property.requiredFunds)}</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-muted-foreground">
            <HandCoins className="h-4 w-4" />
            <span>Cuota Mensual</span>
          </div>
          <span className="font-semibold">{currencyFormatter.format(property.monthlyPayment)}/mes</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
           <div className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            <span>Ratio Endeudamiento</span>
          </div>
          <span className={`font-bold ${property.debtToIncomeRatio > 40 ? 'text-red-500' : 'text-green-600'}`}>
            {property.debtToIncomeRatio.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
