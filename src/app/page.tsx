
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Calculator, Home, KanbanSquare } from "lucide-react";
import Link from "next/link";


const steps = [
  {
    icon: <Calculator className="h-6 w-6 text-blue-600" />,
    title: "Calcula",
    description: "Capacidad de Compra real del Cliente",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: <Home className="h-6 w-6 text-green-600" />,
    title: "Compara",
    description: "Viviendas segun sus posibilidades",
    bgColor: "bg-green-50 dark:bg-green-950/40",
  },
  {
    icon: <KanbanSquare className="h-6 w-6 text-purple-600" />,
    title: "Gestiona",
    description: "Organiza tus clientes en la mano",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
  },
];


export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-white p-4 pt-16 font-headline dark:bg-slate-900">
      
        <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="font-headline text-xl font-extrabold">G</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">GestorHipotecario</h1>
        </div>

        <Card className="w-full max-w-lg shadow-2xl border-primary/10">
          <CardHeader className="items-center text-center p-6 pb-2">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Ventas Sin Perder Tiempo</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Simplifica tu Trabajo</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 pt-4 space-y-2">
             <div className="space-y-3 rounded-lg border bg-card p-4">
              {steps.map((step) => (
                <div key={step.title} className={`flex items-start gap-4 p-3 rounded-lg ${step.bgColor}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 flex-shrink-0">
                        {step.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-base">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 text-center">
              <span className="text-4xl font-extrabold">49€</span>
              <span className="text-muted-foreground">/mes</span>
              <p className="text-sm text-muted-foreground font-semibold mt-1">
                <strong>Pruébalo 14 días.</strong> Cancela cuando quieras.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button asChild className="w-full text-base font-bold" size="lg">
              <Link href="/login">
                Empezar prueba de 14 días
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
