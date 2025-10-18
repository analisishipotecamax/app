
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Auth service is not available");
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "El email o la contraseña son incorrectos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Auth service is not available");
      await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      router.push('/dashboard');
      toast({
        title: "¡Cuenta Creada y Sesión Iniciada!",
        description: "Te hemos llevado directamente a tu nuevo panel de control.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Error al crear la cuenta",
          description: "Este correo electrónico ya está en uso. Por favor, intenta iniciar sesión.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al crear la cuenta",
          description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "Por favor, introduce tu dirección de correo electrónico.",
      });
      return;
    }
    setIsResetting(true);
    try {
      if (!auth) throw new Error("Auth service is not available");
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña. El correo puede tardar unos minutos.",
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
       if (error.code === 'auth/user-not-found') {
        toast({
          variant: "destructive",
          title: "Usuario no encontrado",
          description: "No existe ninguna cuenta con ese correo electrónico.",
        });
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo más tarde.",
        });
      }
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue="signup" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu cuenta de agente inmobiliario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-xs font-medium text-primary hover:underline underline-offset-4"
                        >
                          ¿Has olvidado tu contraseña?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Restablecer Contraseña</DialogTitle>
                          <DialogDescription>
                            Introduce tu correo electrónico y te enviaremos un enlace para que puedas restablecer tu contraseña.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="tu@email.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                disabled={isResetting}
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={isResetting}>
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button type="button" onClick={handlePasswordReset} disabled={isResetting}>
                             {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Enviar enlace
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Acceder'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Comienza tu Prueba Gratuita</CardTitle>
              <CardDescription>
                Regístrate y obtén 14 días de acceso completo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignUp} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Cuenta y Empezar'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
