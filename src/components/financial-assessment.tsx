
"use client";

import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { PiggyBank, Home, CalendarClock, HandCoins, RotateCcw, Users, Star } from "lucide-react";
import type { FinancialData, FinancialInputs } from '@/lib/types';


const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const calculateLoan = (payment: number, term: number, interestRate: number) => {
  if (interestRate <= 0 || term <= 0) {
    return 0;
  }
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = term * 12;
  
  const loanAmount = monthlyInterestRate > 0 
    ? payment * ( (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments)) / monthlyInterestRate )
    : payment * numberOfPayments;

  return loanAmount;
};

interface FinancialAssessmentProps {
  onCalculatedData: (data: FinancialData | null) => void;
  inputs: FinancialInputs;
  setInputs: (inputs: FinancialInputs) => void;
  onClear: () => void;
}


export default function FinancialAssessment({ onCalculatedData, inputs, setInputs, onClear }: FinancialAssessmentProps) {
  const [use90financing, setUse90financing] = useState(false);
  const interestRate = 3.5;
  
  // Defensive destructuring with default values to prevent crash
  const safeInputs = inputs || {
    numberOfHolders: '1',
    monthlyIncome: '',
    annualPayments: '',
    age: '',
    employmentStatus: '',
    monthlyIncome2: '',
    annualPayments2: '',
    age2: '',
    employmentStatus2: '',
    monthlyExpenses: '',
    selectedTerm: 'max',
  };

  const { 
    numberOfHolders, 
    monthlyIncome, 
    annualPayments, 
    age, 
    employmentStatus,
    monthlyIncome2,
    annualPayments2,
    age2,
    employmentStatus2,
    monthlyExpenses,
    selectedTerm
  } = safeInputs;

  const handleInputChange = (field: keyof FinancialInputs, value: string | number) => {
    setInputs({ ...safeInputs, [field]: value });
  };
  
  const handleRadioChange = (field: keyof FinancialInputs, value: string) => {
    setInputs({ ...safeInputs, [field]: value });
  };

  const calculatedData: FinancialData | null = useMemo(() => {
    const income1 = (Number(monthlyIncome) * Number(annualPayments)) / 12;
    const age1 = Number(age) || 0;
    
    const income2 = numberOfHolders === '2' ? ( (Number(monthlyIncome2) * Number(annualPayments2)) / 12 ) : 0;
    const age2Val = numberOfHolders === '2' ? (Number(age2) || 0) : 0;

    const totalIncome = income1 + income2;
    const expenses = Number(monthlyExpenses) || 0;
    
    const youngerAge = age2Val > 0 ? Math.min(age1, age2Val) : age1;

    if (totalIncome <= 0 || youngerAge <= 0) {
      return null;
    }

    const netIncome = Math.max(0, totalIncome - expenses);
    const debtRatio = expenses > 0 ? 0.30 : 0.35;
    const payment = netIncome * debtRatio;

    const termBasedOnAge = Math.max(1, 75 - youngerAge);
    const calculatedMaxTerm = Math.min(termBasedOnAge, 40);

    const anyHolderUnder36 = age1 < 36 || (numberOfHolders === '2' && age2Val < 36);
    const totalMonthlyIncome = income1 + income2;
    const meetsIncomeThreshold = totalMonthlyIncome > 1500;
    const loanForSpecialCheck = calculateLoan(payment, calculatedMaxTerm, interestRate);
    const specialConditionsMetBase = anyHolderUnder36 && meetsIncomeThreshold && loanForSpecialCheck > 100000;
    
    const meetsSpecialConditions = specialConditionsMetBase && !use90financing;

    const termToUseFor90 = selectedTerm === '30' && calculatedMaxTerm > 30 ? 30 : calculatedMaxTerm;
    
    const finalLoanTerm = meetsSpecialConditions ? 30 : termToUseFor90;
    const loanAmount = calculateLoan(payment, finalLoanTerm, interestRate);
    
    const financingPercentage = meetsSpecialConditions ? 0.95 : 0.90; // Logic adjusted
    const purchasePrice = loanAmount / financingPercentage;


    return {
      maxMonthlyPayment: payment,
      maxLoanTerm: calculatedMaxTerm,
      loanTerm: finalLoanTerm,
      maxLoanAmount: loanAmount,
      idealPurchasePrice: purchasePrice,
      meetsSpecialConditions: meetsSpecialConditions,
      meetsSpecialConditionsBase: specialConditionsMetBase,
      idealPurchasePrice90: loanAmount / 0.90, // Keep for comparison if needed
      totalIncome: totalIncome,
      monthlyExpenses: expenses
    };
  }, [monthlyIncome, annualPayments, monthlyExpenses, age, selectedTerm, numberOfHolders, monthlyIncome2, annualPayments2, age2, use90financing]);

  useEffect(() => {
    onCalculatedData(calculatedData);
  }, [calculatedData, onCalculatedData]);

  useEffect(() => {
    if (calculatedData && calculatedData.maxLoanTerm <= 30) {
      handleInputChange('selectedTerm', 'max');
    }
  }, [calculatedData]);
  
  useEffect(() => {
    if (calculatedData && !calculatedData.meetsSpecialConditionsBase) {
      setUse90financing(false);
    }
  }, [calculatedData]);

  const { maxMonthlyPayment = 0, maxLoanTerm = 0, loanTerm = 0, maxLoanAmount = 0, idealPurchasePrice = 0, meetsSpecialConditions = false, meetsSpecialConditionsBase = false } = calculatedData || {};

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Estudio Viabilidad</CardTitle>
        <CardDescription>
          Introduce los datos del cliente para estimar el precio de la vivienda que se puede permitir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-6">
            <div className="flex justify-end items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClear}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
            
            <div className="space-y-3">
              <Label>Número de Titulares</Label>
              <RadioGroup
                value={numberOfHolders}
                onValueChange={(value) => handleRadioChange('numberOfHolders', value)}
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="holders-1" />
                  <Label htmlFor="holders-1" className="font-normal">1 Titular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="holders-2" />
                  <Label htmlFor="holders-2" className="font-normal">2 Titulares</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
               <h4 className="font-headline text-lg text-primary border-b pb-2">Titular 1</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="income1">Ingresos Netos / Paga</Label>
                  <Input id="income1" type="number" value={monthlyIncome} onChange={e => handleInputChange('monthlyIncome', e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 2000" />
                </div>
                <div className="space-y-2">
                  <Label>Pagas Anuales</Label>
                  <Select value={annualPayments} onValueChange={(value) => handleInputChange('annualPayments', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona Pagas..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 pagas</SelectItem>
                      <SelectItem value="14">14 pagas</SelectItem>
                      <SelectItem value="15">15 pagas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
               </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age1">Edad</Label>
                  <Input id="age1" type="number" value={age} onChange={e => handleInputChange('age', e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 35" />
                </div>
                <div className="space-y-2">
                   <Label>Situación Laboral</Label>
                    <Select value={employmentStatus} onValueChange={(value) => handleInputChange('employmentStatus', value)}>
                        <SelectTrigger><SelectValue placeholder="Selecciona una situación..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fijo">Fijo</SelectItem>
                        <SelectItem value="Funcionario">Funcionario</SelectItem>
                        <SelectItem value="Interino">Interino</SelectItem>
                        <SelectItem value="Temporal">Temporal</SelectItem>
                        <SelectItem value="Self-Employed">Autónomo</SelectItem>
                        <SelectItem value="Unemployed">Desempleado</SelectItem>
                        <SelectItem value="Retired">Jubilado</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>

              {numberOfHolders === '2' && (
                <div className="space-y-4 pt-4 border-t mt-4">
                  <h4 className="font-headline text-lg text-primary border-b pb-2">Titular 2</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="income2">Ingresos Netos / Paga</Label>
                      <Input id="income2" type="number" value={monthlyIncome2} onChange={e => handleInputChange('monthlyIncome2', e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 1800" />
                    </div>
                    <div className="space-y-2">
                       <Label>Pagas Anuales</Label>
                        <Select value={annualPayments2} onValueChange={(value) => handleInputChange('annualPayments2', value)}>
                          <SelectTrigger><SelectValue placeholder="Selecciona Pagas..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 pagas</SelectItem>
                            <SelectItem value="14">14 pagas</SelectItem>
                            <SelectItem value="15">15 pagas</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age2">Edad</Label>
                      <Input id="age2" type="number" value={age2} onChange={e => handleInputChange('age2', e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 32" />
                    </div>
                    <div className="space-y-2">
                      <Label>Situación Laboral</Label>
                        <Select value={employmentStatus2} onValueChange={(value) => handleInputChange('employmentStatus2', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecciona una situación..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fijo">Fijo</SelectItem>
                            <SelectItem value="Funcionario">Funcionario</SelectItem>
                            <SelectItem value="Interino">Interino</SelectItem>
                            <SelectItem value="Temporal">Temporal</SelectItem>
                            <SelectItem value="Self-Employed">Autónomo</SelectItem>
                            <SelectItem value="Unemployed">Desempleado</SelectItem>
                            <SelectItem value="Retired">Jubilado</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t mt-4">
                <Label htmlFor="expenses">Gastos Mensuales (Comunes)</Label>
                <Input id="expenses" type="number" value={monthlyExpenses} onChange={e => handleInputChange('monthlyExpenses', e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 500" />
              </div>

              {maxLoanTerm > 30 && !meetsSpecialConditions && !use90financing && (
                <div className="space-y-3 pt-4">
                  <Label>Elige el Plazo del Préstamo</Label>
                  <RadioGroup
                    value={selectedTerm}
                    onValueChange={(value) => handleRadioChange('selectedTerm', value)}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="max" id="max-term" />
                      <Label htmlFor="max-term" className="font-normal">{`Máximo (${maxLoanTerm} años)`}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="30-term" />
                      <Label htmlFor="30-term" className="font-normal">30 años</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
             <h3 className="font-headline text-xl font-semibold text-primary">Resultados Estimados</h3>
            {calculatedData ? (
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-blue-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Precio de Compra Ideal</CardTitle>
                    <Home className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{currencyFormatter.format(idealPurchasePrice)}</div>
                     <p className="text-xs text-muted-foreground">Basado en un préstamo del {meetsSpecialConditions ? '95%' : '90%'} del valor.</p>
                  </CardContent>
                </Card>
                
                {meetsSpecialConditionsBase && (
                  <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <AlertDescription>
                        <span className="font-bold">¡Condiciones especiales!</span> Cumples los requisitos para una posible financiación de hasta el 95% a 30 años.
                      </AlertDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox id="use-90-financing" checked={use90financing} onCheckedChange={(checked) => setUse90financing(Boolean(checked))} />
                        <label
                          htmlFor="use-90-financing"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Calcular con 90% y plazo máximo ({maxLoanTerm} años) para comparar.
                        </label>
                      </div>
                    </div>
                  </Alert>
                )}

                <Card className="bg-green-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Cuota Máxima Mensual</CardTitle>
                    <HandCoins className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyFormatter.format(maxMonthlyPayment)}</div>
                  </CardContent>
                </Card>
                 <Card className="bg-yellow-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Importe Máximo a Solicitar</CardTitle>
                    <PiggyBank className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyFormatter.format(maxLoanAmount)}</div>
                  </CardContent>
                </Card>
                 <Card className="bg-purple-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Plazo del Préstamo</CardTitle>
                    <CalendarClock className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loanTerm} años</div>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground pt-4 text-center">Interés anual fijo del 3,5%. Cálculo orientativo.</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground pt-10">
                <p>Introduce tus datos para ver los resultados.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

