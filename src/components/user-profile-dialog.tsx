
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useUserProfile } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { provinces } from "@/lib/itp-rates";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";

interface UserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ isOpen, onOpenChange }: UserProfileDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: userProfile, isLoading: isProfileLoading, revalidate } = useUserProfile();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [defaultProvince, setDefaultProvince] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setDefaultProvince(userProfile.defaultProvince || "");
    }
  }, [userProfile, isOpen]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "No se ha podido identificar al usuario. Por favor, recarga la página.",
      });
      return;
    }

    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const profileData: Omit<UserProfile, 'id'> = {
      email: user.email!, 
      name: name,
      defaultProvince: defaultProvince,
    };
    
    setDoc(userDocRef, profileData, { merge: true }).then(() => {
        toast({
            title: "Perfil guardado",
            description: "Tu información se ha actualizado correctamente.",
        });
        revalidate(); // Force re-fetch of user profile data
        onOpenChange(false);
    }).catch((serverError) => {
        console.error("Error saving profile:", serverError);
        errorEmitter.emit('permission-error', {
          // @ts-ignore
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: profileData,
        });
        toast({
            variant: "destructive",
            title: "Error al guardar el perfil",
            description: "No se pudo guardar la información. Revisa los permisos de la base de datos.",
        });
    }).finally(() => {
        setIsSaving(false);
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mi Perfil de Agente</DialogTitle>
          <DialogDescription>
            Personaliza tu información. La comunidad por defecto se usará en las nuevas simulaciones.
          </DialogDescription>
        </DialogHeader>

        {isProfileLoading && !userProfile ? (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                Email
                </Label>
                <Input id="email" value={user?.email || ""} readOnly disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Nombre
                </Label>
                <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre o empresa"
                className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="province" className="text-right">
                Comunidad
                </Label>
                <Select value={defaultProvince} onValueChange={setDefaultProvince}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona tu comunidad..." />
                    </SelectTrigger>
                    <SelectContent>
                        {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            </div>
        )}
        
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving || (isProfileLoading && !userProfile) }>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    