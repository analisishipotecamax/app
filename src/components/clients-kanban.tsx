
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Phone, RotateCw, ArrowUp, ArrowDown } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import type { Client } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";


const ClientCard = ({ client, onDelete, onStatusChange, onLoadClient, onMove, isFirst, isLast }: { client: Client, onDelete: (clientId: string) => void, onStatusChange: (clientId: string, status: Client['status']) => void, onLoadClient: (client: Client) => void, onMove: (clientId: string, direction: 'up' | 'down') => void, isFirst: boolean, isLast: boolean }) => {
  const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const [creationInfo, setCreationInfo] = useState<{ date: string, days: number | null }>({ date: '', days: null });

  useEffect(() => {
    // This code runs only on the client, after hydration, to prevent mismatch
    if (!client.createdAt) {
      setCreationInfo({ date: '', days: null });
      return;
    }
    
    // Ensure createdAt is a Date object, converting from Firestore Timestamp if needed
    const creationDate = client.createdAt.toDate ? client.createdAt.toDate() : new Date(client.createdAt);
    
    // Check if the date is valid before proceeding
    if (isNaN(creationDate.getTime())) {
      setCreationInfo({ date: '', days: null });
      return;
    }

    const formattedDate = format(creationDate, "dd/MM/yyyy", { locale: es });
    const daysPassed = differenceInDays(new Date(), creationDate);

    setCreationInfo({ date: formattedDate, days: daysPassed });
  }, [client.createdAt]);


  const { date: creationDate, days: daysPassed } = creationInfo;


  const handleCheckboxChange = (checked: boolean, status: Client['status']) => {
    if (checked) {
      onStatusChange(client.id, status);
    } else {
      // If unchecked, revert to default status
      onStatusChange(client.id, 'default');
    }
  };


  return (
    <Card className={cn("mb-4 relative group transition-colors", {
        "bg-orange-50 dark:bg-orange-950": client.status === '2visita',
        "bg-green-50 dark:bg-green-950": client.status === 'arras',
    })}>
      <div className="absolute top-2 left-3 flex items-center gap-4">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{creationDate}</span>
            {daysPassed !== null && (
                <span className={cn(
                'font-semibold',
                daysPassed > 5 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                ({daysPassed} días)
                </span>
            )}
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(client.id, 'up')} disabled={isFirst}>
                <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(client.id, 'down')} disabled={isLast}>
                <ArrowDown className="h-4 w-4" />
            </Button>
        </div>
       </div>
       <div className="absolute top-2 right-2 flex items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100 group-hover:bg-red-100 dark:group-hover:bg-red-900">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro que quieres eliminar a {client.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente al cliente y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(client.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
       </div>
      <CardHeader className="pt-16 pb-4">
        <div>
            <CardTitle className="text-xl pr-10">{client.name}</CardTitle>
            <CardDescription className="text-lg">
            Compra Max: <span className="font-bold text-primary">{currencyFormatter.format(client.maxPurchasePrice)}</span>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id={`arras-${client.id}`} 
                        checked={client.status === 'arras'}
                        onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked), 'arras')}
                    />
                    <Label htmlFor={`arras-${client.id}`} className="text-sm font-medium">Arras</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id={`2visita-${client.id}`}
                        checked={client.status === '2visita'}
                        onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked), '2visita')}
                    />
                    <Label htmlFor={`2visita-${client.id}`} className="text-sm font-medium">2ª Visita</Label>
                </div>
            </div>
            {client.phone && (
                <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900 h-10 w-10">
                        <Phone className="h-6 w-6" />
                    </Button>
                </a>
            )}
        </div>
        <div className="border-t pt-4 flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={() => onLoadClient(client)}>
                <RotateCw className="mr-2 h-4 w-4" />
                Cargar Cliente
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ClientsKanbanProps {
  onLoadClient: (client: Client) => void;
}

export default function ClientsKanban({ onLoadClient }: ClientsKanbanProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const clientsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'clients'),
      orderBy('sortOrder', 'asc')
    );
  }, [firestore, user]);

  const { data: clients, isLoading } = useCollection<Client>(clientsQuery);
  
  const sortedClients = useMemo(() => {
    return clients ? [...clients].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : [];
  }, [clients]);


  const handleDeleteClient = async (clientId: string) => {
    if (!user || !firestore) return;
    const clientDocRef = doc(firestore, 'users', user.uid, 'clients', clientId);
    deleteDoc(clientDocRef).then(() => {
        toast({
            title: "Cliente eliminado",
            description: "El cliente ha sido eliminado de tu lista.",
        });
    }).catch(async (serverError) => {
        console.error("Error deleting client: ", serverError);
        const permissionError = new FirestorePermissionError({
            path: clientDocRef.path,
            operation: 'delete'
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
        });
    });
  };
  
  const handleStatusChange = async (clientId: string, status: Client['status']) => {
    if (!user || !firestore) return;
    const clientDocRef = doc(firestore, 'users', user.uid, 'clients', clientId);
    const updateData = { status };
    updateDoc(clientDocRef, updateData).catch(async (serverError) => {
      console.error("Error updating client status: ", serverError);
      const permissionError = new FirestorePermissionError({
        path: clientDocRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: "destructive",
        title: "Error al actualizar estado",
        description: "No se pudo cambiar el estado del cliente.",
      });
    });
  };

  const handleMoveClient = async (clientId: string, direction: 'up' | 'down') => {
    if (!firestore || !user || !clients || clients.length < 2) return;
  
    const currentIndex = sortedClients.findIndex(c => c.id === clientId);
    if (currentIndex === -1) return;
  
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
    if (targetIndex < 0 || targetIndex >= sortedClients.length) return;
  
    const clientToMove = sortedClients[currentIndex];
    const clientToSwap = sortedClients[targetIndex];
  
    if (!clientToMove || !clientToSwap) return;
  
    const batch = writeBatch(firestore);
  
    const clientToMoveRef = doc(firestore, 'users', user.uid, 'clients', clientToMove.id);
    batch.update(clientToMoveRef, { sortOrder: clientToSwap.sortOrder });
  
    const clientToSwapRef = doc(firestore, 'users', user.uid, 'clients', clientToSwap.id);
    batch.update(clientToSwapRef, { sortOrder: clientToMove.sortOrder });
  
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error moving client:", error);
      toast({
        variant: "destructive",
        title: "Error al reordenar",
        description: "No se pudo cambiar el orden de los clientes.",
      });
    }
  };


  const handleAddClient = () => {
    // This button is now for decoration, main logic is in financial-assessment
    console.log("Adding a new client from Kanban is not implemented. Please use the calculator.");
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div >
                <CardTitle className="font-headline text-3xl">Gestor de Clientes</CardTitle>
                <CardDescription>
                Organiza tus clientes y su capacidad de compra.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        ) : sortedClients && sortedClients.length > 0 ? (
          <div>
            {sortedClients.map((client, index) => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onDelete={handleDeleteClient} 
                onStatusChange={handleStatusChange}
                onLoadClient={onLoadClient}
                onMove={handleMoveClient}
                isFirst={index === 0}
                isLast={index === sortedClients.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aún no tienes clientes.</p>
            <p className="text-muted-foreground text-sm">Usa la pestaña "Buscando" para añadir tu primer cliente después de calcular.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    
