
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialAssessment from "@/components/financial-assessment";
import FindingHome from "@/components/finding-home";
import ClientsKanban from "@/components/clients-kanban";
import { Calculator, Search, Users, LogOut, Settings, ArrowRight } from "lucide-react";
import type { FinancialData, Property, FinancialInputs, Client } from '@/lib/types';
import { useUser, useAuth, useUserProfile } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserProfileDialog } from '@/components/user-profile-dialog';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

function DashboardPageContent() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<FinancialInputs>({
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
  });
  const auth = useAuth();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("assessment");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleClear = () => {
    setInputs({
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
    });
    setProperties([]);
    setFinancialData(null);
    setClientName('');
    setClientPhone('');
    setEditingClientId(null);
  };

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };
  
  const handleLoadClient = (client: Client) => {
    setEditingClientId(client.id); 
    setInputs(client.financialInputs);
    setClientName(client.name);
    setClientPhone(client.phone || '');
    if (client.maxPurchasePrice && client.financialInputs) {
        const data: FinancialData = {
            idealPurchasePrice: client.maxPurchasePrice,
            maxMonthlyPayment: 0, // Estos valores no se guardan, asi que se resetean
            maxLoanTerm: 0,
            loanTerm: 0,
            maxLoanAmount: 0,
            meetsSpecialConditions: false,
            meetsSpecialConditionsBase: false,
            idealPurchasePrice90: 0,
            totalIncome: 0,
            monthlyExpenses: 0,
        };
        setFinancialData(data);
    }
    if (client.favoriteProperty) {
      setProperties([client.favoriteProperty]);
    } else {
      setProperties([]);
    }
    setActiveTab('assessment');
    setTimeout(() => setActiveTab('finding'), 50); // Pequeño delay para asegurar que los componentes se re-renderizan
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      <FirebaseErrorListener />
      <header className="flex items-center justify-between mb-8 w-full">
        <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="font-headline font-extrabold text-xl">G</span>
            </div>
            {userProfile?.name && <span className="hidden sm:inline text-lg font-semibold">{userProfile.name}</span>}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            {!isProfileLoading && !userProfile?.defaultProvince && (
              <div className="flex items-center gap-1 sm:gap-2 text-red-500 animate-pulse">
                <span className="text-xs sm:text-sm font-semibold">Primero Crea Tu Perfil</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileDialogOpen(true)}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Ajustes de Perfil</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-2 sm:px-4"
            >
              <LogOut className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
        </div>
      </header>
      <main className="w-full max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 h-auto">
            <TabsTrigger value="assessment" className="py-3 text-base">
              <Calculator className="mr-2" />
              Operacion
            </TabsTrigger>
            <TabsTrigger value="finding" className="py-3 text-base">
              <Search className="mr-2" />
              Vivienda
            </TabsTrigger>
            <TabsTrigger value="clients" className="py-3 text-base">
              <Users className="mr-2" />
              Clientes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="assessment" className="mt-6">
            <FinancialAssessment
              onCalculatedData={setFinancialData}
              inputs={inputs}
              setInputs={setInputs}
              onClear={handleClear}
            />
          </TabsContent>
          <TabsContent value="finding" className="mt-6">
            <FindingHome 
                financialData={financialData} 
                properties={properties} 
                setProperties={setProperties}
                clientName={clientName}
                setClientName={setClientName}
                clientPhone={clientPhone}
                setClientPhone={setClientPhone}
                onSaveAndClear={handleClear}
                setActiveTab={setActiveTab}
                financialInputs={inputs}
                editingClientId={editingClientId}
             />
          </TabsContent>
          <TabsContent value="clients" className="mt-6">
            <ClientsKanban onLoadClient={handleLoadClient} />
          </TabsContent>
        </Tabs>
      </main>
      {<UserProfileDialog isOpen={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />}
    </div>
  );
}


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <DashboardPageContent />;
}
