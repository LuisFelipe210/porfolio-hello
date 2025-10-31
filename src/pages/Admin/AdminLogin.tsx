import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ***** INÍCIO DAS MODIFICAÇÕES *****
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

// 1. Esquema de validação com Zod
const formSchema = z.object({
    username: z.string().min(1, { message: "O utilizador é obrigatório." }),
    password: z.string().min(1, { message: "A palavra-passe é obrigatória." }),
});
// ***** FIM DAS MODIFICAÇÕES *****


const AdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    // ***** INÍCIO DAS MODIFICAÇÕES *****
    // 2. O formulário agora é controlado pelo React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // 3. A função de submit é adaptada para o React Hook Form
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        form.clearErrors();

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // Usa os dados validados do formulário
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenciais inválidas');
            }

            const { token } = await response.json();
            localStorage.setItem('authToken', token);

            toast({
                title: 'Login bem-sucedido!',
                description: 'A redirecionar para o painel...',
                variant: 'success',
                duration: 1500,
            });

            setTimeout(() => {
                navigate('/admin');
            }, 1500);

        } catch (error) {
            form.setError("password", {
                type: "manual",
                message: error instanceof Error ? error.message : "Utilizador ou palavra-passe incorretos."
            });
        } finally {
            setIsLoading(false);
        }
    };
    // ***** FIM DAS MODIFICAÇÕES *****

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            <Card className="w-full max-w-sm z-10 animate-fade-in-up bg-black/50 backdrop-blur-lg border border-white/10 text-white rounded-3xl">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Acesso ao Painel</CardTitle>
                    <CardDescription className="text-white/80">
                        Faça login para gerir o seu website.
                    </CardDescription>
                </CardHeader>

                {/* ***** INÍCIO DAS MODIFICAÇÕES NO JSX ***** */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="grid gap-2">
                                        <Label htmlFor="username">Utilizador</Label>
                                        <FormControl>
                                            <Input
                                                id="username"
                                                type="text"
                                                required
                                                placeholder="O seu utilizador"
                                                className="bg-black/70 border-white/20 rounded-xl h-12"
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
                                        <Label htmlFor="password">Palavra-passe</Label>
                                        <FormControl>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="bg-black/70 border-white/20 rounded-xl h-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all" type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
                {/* ***** FIM DAS MODIFICAÇÕES NO JSX ***** */}
            </Card>
        </div>
    );
};

export default AdminLogin;