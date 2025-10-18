
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PropertyCard from "@/components/property-card";
import { ITP_RATES, ItpRate, ItpBonus } from "@/lib/itp-rates";
import type { FinancialData, Property, FinancialInputs, Client } from '@/lib/types';
import { PlusCircle, Home, Save, Edit, Loader2 } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase, useUserProfile } from "@/firebase";
import { collection, serverTimestamp, query, addDoc, updateDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

interface FindingHomeProps {
  financialData: FinancialData | null;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  clientName: string;
  setClientName: (name: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  onSaveAndClear: () => void;
  setActiveTab: (tab: string) => void;
  financialInputs: FinancialInputs;
  editingClientId: string | null;
}

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const calculateItp = (
  propertyPrice: number,
  province: string,
  financialInputs: FinancialInputs
): number => {
  const itpConfig = ITP_RATES[province];
  if (!itpConfig) return 0; // Or handle error

  const { numberOfHolders, monthlyIncome, annualPayments, age, monthlyIncome2, annualPayments2, age2 } = financialInputs;

  const holder1 = {
    age: Number(age) || 0,
    income: (Number(monthlyIncome) * Number(annualPayments)),
  };

  const holder2 = numberOfHolders === '2' ? {
    age: Number(age2) || 0,
    income: (Number(monthlyIncome2) * Number(annualPayments2)),
  } : null;

  const totalIncome = holder1.income + (holder2?.income || 0);

  const checkConditions = (bonus: ItpBonus, holder: { age: number, income: number }, price: number, totalIncome: number, numHolders: number): boolean => {
    const { maxAge, maxPropertyPrice, maxIncome, maxJointIncome } = bonus.conditions;
    if (maxAge && holder.age >= maxAge) return false;
    if (maxPropertyPrice && price > maxPropertyPrice) return false;
    if (numHolders === 1 && maxIncome && holder.income > maxIncome) return false;
    if (numHolders === 2 && maxJointIncome && totalIncome > maxJointIncome) return false;
    if (numHolders === 2 && maxIncome && (holder1.income > maxIncome || (holder2 && holder2.income > maxIncome))) {
        // For some bonuses like Extremadura, individual income limit applies even if joint income is checked.
        // This is a simplification; real rules can be more complex.
        // We'll check if ANY holder exceeds individual limit IF a joint limit is also present.
        if (maxJointIncome) {
           return false
        }
    }


    return true;
  };

  const getHolderRate = (holder: { age: number, income: number }, price: number, totalIncome: number, numHolders: number): number => {
    const applicableBonus = itpConfig.bonuses?.find(b => checkConditions(b, holder, price, totalIncome, numHolders));
    return applicableBonus ? applicableBonus.rate : itpConfig.general;
  };

  if (numberOfHolders === '1') {
    const rate = getHolderRate(holder1, propertyPrice, holder1.income, 1);
    return propertyPrice * (rate / 100);
  } else if (numberOfHolders === '2' && holder2) {
    const pricePerHolder = propertyPrice / 2;
    const rate1 = getHolderRate(holder1, propertyPrice, totalIncome, 2);
    const rate2 = getHolderRate(holder2, propertyPrice, totalIncome, 2);
    const itp1 = pricePerHolder * (rate1 / 100);
    const itp2 = pricePerHolder * (rate2 / 100);
    return itp1 + itp2;
  }

  return propertyPrice * (itpConfig.general / 100); // Fallback
};


export default function FindingHome({ 
  financialData, 
  properties, 
  setProperties, 
  clientName, 
  setClientName, 
  clientPhone, 
  setClientPhone, 
  onSaveAndClear, 
  setActiveTab, 
  financialInputs,
  editingClientId,
}: FindingHomeProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: userProfile, isLoading: isProfileLoading, revalidate } = useUserProfile();

  const clientsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'clients'));
  }, [firestore, user]);

  const { data: clients } = useCollection<Client>(clientsQuery);
  
  const handleSaveOrUpdateClient = async () => {
    if (!user || !firestore || !financialData || !clientName) {
      toast({
        variant: "destructive",
        title: "Faltan datos",
        description: "Asegúrate de haber introducido el nombre del cliente y calculado sus datos financieros.",
      });
      return;
    }
  
    const favoriteProperty = properties.find(p => p.isFavorite) || null;
    const clientDocRef = editingClientId 
      ? doc(firestore, 'users', user.uid, 'clients', editingClientId)
      : collection(firestore, 'users', user.uid, 'clients');
      
    const isEditing = !!editingClientId;
    setIsSaving(!isEditing);
    setIsUpdating(isEditing);

    // Prepare phone number: add Spanish prefix if missing
    let finalPhoneNumber = clientPhone.trim();
    if (finalPhoneNumber && !finalPhoneNumber.startsWith('34')) {
      finalPhoneNumber = '34' + finalPhoneNumber;
    }


    const clientData = {
        name: clientName,
        phone: finalPhoneNumber,
        maxPurchasePrice: financialData.idealPurchasePrice,
        financialInputs: financialInputs,
        favoriteProperty: favoriteProperty,
        ...(isEditing ? {} : {
          userId: user.uid,
          createdAt: serverTimestamp(),
          status: 'default' as const,
          sortOrder: (clients ? Math.max(0, ...clients.map(c => c.sortOrder || 0)) : 0) + 1,
        })
    };

    const operation = isEditing 
      ? updateDoc(clientDocRef, clientData) 
      : addDoc(clientDocRef as any, clientData);

    operation.then(() => {
        toast({
            title: `Cliente ${isEditing ? 'actualizado' : 'guardado'}`,
            description: `${clientName} ha sido ${isEditing ? 'actualizado' : 'añadido'} correctamente.`,
        });
        onSaveAndClear(); 
        setActiveTab('clients');
    }).catch(async (serverError) => {
        console.error(`Error ${isEditing ? 'updating' : 'saving'} client:`, serverError);
        const permissionError = new FirestorePermissionError({
          path: isEditing ? (clientDocRef as any).path : `users/${user.uid}/clients`,
          operation: isEditing ? 'update' : 'create',
          requestResourceData: clientData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: `Error al ${isEditing ? 'actualizar' : 'guardar'}`,
            description: `No se pudo ${isEditing ? 'actualizar' : 'guardar'} el cliente. Revisa los permisos de la base de datos.`,
        });
    }).finally(() => {
        setIsSaving(false);
        setIsUpdating(false);
    });
  };


  const handleAddProperty = () => {
    revalidate();
    const province = userProfile?.defaultProvince;

    if (!province) {
      toast({
        variant: "destructive",
        title: "Falta la comunidad",
        description: "Debes establecer una comunidad por defecto en tu perfil (Ajustes ⚙️) para añadir una vivienda."
      });
      return;
    }
    if (properties.length >= 3) {
      toast({
          variant: "destructive",
          title: "Límite alcanzado",
          description: "Puedes añadir un máximo de 3 viviendas para comparar."
      });
      return;
    }
    if (!name || !price) {
      toast({
          variant: "destructive",
          title: "Faltan campos",
          description: "Por favor, completa todos los campos para añadir una vivienda."
      });
      return;
    }
    if (!financialData) {
      toast({
          variant: "destructive",
          title: "Calculadora no usada",
          description: "Completa primero la calculadora para poder añadir viviendas."
      });
      return;
    }

    if(!ITP_RATES[province]) {
        toast({ variant: "destructive", title: "Comunidad no válida", description: "La comunidad seleccionada no es válida para el cálculo del ITP." });
        return;
    }

    const financingPercentage = financialData.meetsSpecialConditions ? 0.95 : 0.90;
    const downPaymentPercentage = 1 - financingPercentage;

    const financingAmount = Number(price) * financingPercentage;
    const downPayment = Number(price) * downPaymentPercentage;
    const itpAmount = calculateItp(Number(price), province, financialInputs);
    const fixedCosts = 3000;
    const requiredFunds = downPayment + itpAmount + fixedCosts;

    const interestRate = 3.5 / 100;
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = financialData.loanTerm * 12;
    
    const monthlyPayment = monthlyInterestRate > 0
    ? financingAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
    : financingAmount / numberOfPayments;

    const totalMonthlyDebt = (financialData.monthlyExpenses || 0) + monthlyPayment;
    const debtToIncomeRatio = financialData.totalIncome > 0 ? (totalMonthlyDebt / financialData.totalIncome) * 100 : 0;

    const newProperty: Property = {
      id: Date.now(),
      name,
      price: Number(price),
      province: province,
      financingAmount,
      requiredFunds,
      monthlyPayment,
      debtToIncomeRatio,
      isFavorite: false,
    };

    setProperties([...properties, newProperty]);
    setName("");
    setPrice("");
  };

  const removeProperty = (id: number) => {
    const newProperties = properties.filter(p => p.id !== id);
    setProperties(newProperties);
  };
  
  const toggleFavorite = (id: number) => {
    setProperties(properties.map(p => ({
      ...p,
      isFavorite: p.id === id ? !p.isFavorite : false
    })));
  };

  const isEditing = !!editingClientId;
  const isLoading = isSaving || isUpdating;

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
       <CardHeader>
        <CardTitle className="font-headline text-3xl">Buscando Vivienda</CardTitle>
        <CardDescription>
          Simula y compara las opciones de vivienda para tu cliente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mb-6">
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <Label htmlFor="client-name" className="font-semibold">Nombre del Cliente</Label>
                        <Input 
                            id="client-name" 
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)} 
                            placeholder="Introduce el nombre..." 
                            className="font-semibold text-base"
                            disabled={!financialData}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone" className="font-semibold">Teléfono WhatsApp</Label>
                        <Input 
                            id="client-phone"
                            type="tel"
                            value={clientPhone} 
                            onChange={e => setClientPhone(e.target.value)} 
                            placeholder="Ej: 659252525" 
                            className="font-semibold text-base"
                            disabled={!financialData}
                        />
                    </div>
                </div>
          </div>


          {financialData ? (
             <Card className="bg-blue-50 dark:bg-blue-950">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Precio de Compra Ideal para {clientName || 'este cliente'}</CardTitle>
                  <Home className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{currencyFormatter.format(financialData.idealPurchasePrice)}</div>
                   <p className="text-xs text-muted-foreground">Basado en un préstamo del {financialData.meetsSpecialConditions ? '95%' : '90%'} del valor.</p>
                </CardContent>
              </Card>
          ) : (
             <Alert variant="destructive">
                 <AlertDescription>
                   Por favor, completa primero los datos en la pestaña <strong>Operacion</strong> para poder simular hipotecas y guardar a tu cliente.
                 </AlertDescription>
             </Alert>
          )}

          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <h3 className="font-headline text-lg mb-4">Añadir Vivienda a Comparar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="name">Referencia</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="p. ej. Chalet en la sierra" disabled={!financialData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="p. ej. 250000" disabled={!financialData} />
                </div>
                 <div className="space-y-2">
                    <Label>Comunidad (desde tu perfil)</Label>
                    <Input 
                        value={isProfileLoading ? "Cargando..." : (userProfile?.defaultProvince || "No definida en tu perfil")} 
                        disabled 
                        className={cn("font-medium", !isProfileLoading && !userProfile?.defaultProvince && "text-destructive placeholder:text-destructive")}
                    />
                </div>
            </div>
             <div className="flex items-center justify-end mt-4">
                 <Button onClick={handleAddProperty} disabled={!financialData || isProfileLoading} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Vivienda
                </Button>
            </div>
          </div>
        </div>

        {properties.length > 0 && 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {properties.map(prop => (
                    <PropertyCard 
                        key={prop.id} 
                        property={prop} 
                        onRemove={removeProperty}
                        onToggleFavorite={toggleFavorite}
                        meetsSpecialConditions={financialData?.meetsSpecialConditions || false} 
                    />
                ))}
            </div>
        }

      </CardContent>
       <CardFooter className="flex justify-center bg-slate-50 p-4 border-t dark:bg-slate-900">
          <Button onClick={handleSaveOrUpdateClient} disabled={!financialData || !clientName || isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Edit className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
              {isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </Button>
        </CardFooter>
    </Card>
  );
}

    