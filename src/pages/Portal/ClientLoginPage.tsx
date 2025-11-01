import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';
import Header from '@/components/Header';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

// Schema (sem alteração)
const formSchema = z.object({
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    password: z.string().min(1, { message: "A palavra-passe é obrigatória." }),
});

interface LoginResponse {
    token: string;
    mustResetPassword?: boolean;
}

const loginAPI = async (data: z.infer<typeof formSchema>): Promise<LoginResponse> => {
    const response = await fetch('/api/portal?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciais inválidas');
    }

    return response.json();
};


const ClientLoginPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginAPI,
        onSuccess: (data) => {
            const { token, mustResetPassword } = data;
            localStorage.setItem('clientAuthToken', token);

            toast({
                title: 'Login bem-sucedido!',
                description: 'A redirecionar para o seu portal...',
                variant: "success",
                duration: 1500,
            });

            setTimeout(() => {
                if (mustResetPassword) {
                    navigate('/portal/reset-password');
                } else {
                    navigate('/portal/gallery');
                }
            }, 1500);
        },
        onError: (error) => {
            form.setError("password", {
                type: "manual",
                message: error instanceof Error ? error.message : "Email ou senha incorretos."
            });
        }
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        form.clearErrors();
        loginMutation.mutate(data);
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background text-foreground p-4">
            <Header isLoginPage={true} />
            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            <Card className="w-full max-w-sm z-10 animate-fade-in-up bg-card/50 backdrop-blur-lg border rounded-3xl">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Portal do Cliente</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                        Aceda à sua galeria privada para selecionar as suas fotos.
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid gap-2">
                                        <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                placeholder="O seu email de acesso"
                                                className="bg-input border-border rounded-xl h-12 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="grid gap-2">
                                        <Label htmlFor="password" className="text-black dark:text-white">Palavra-passe</Label>
                                        <FormControl>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="bg-input border-border rounded-xl h-12 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-orange-500 text-black hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all" type="submit" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? <Loader2 className="animate-spin" /> : 'Entrar'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
};

export default ClientLoginPage;