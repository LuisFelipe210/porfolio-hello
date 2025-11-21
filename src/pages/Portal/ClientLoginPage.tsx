import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import Logo from "@/assets/logo.svg"; // CONFIRA SE O CAMINHO DA LOGO TÁ CERTO

// --- SCHEMA ---
const formSchema = z.object({
    email: z.string().email({ message: "Email inválido." }),
    password: z.string().min(1, { message: "Senha obrigatória." }),
});

// --- API ---
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
                title: 'Sucesso!',
                description: 'Entrando na galeria...',
                duration: 2000
            });

            setTimeout(() => {
                if (mustResetPassword) navigate('/portal/reset-password');
                else navigate('/portal/gallery');
            }, 1000);
        },
        onError: (error) => {
            form.setError("root", {
                type: "manual",
                message: error instanceof Error ? error.message : "Erro ao entrar."
            });
        }
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        form.clearErrors();
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen w-full flex bg-white text-zinc-900 font-sans">

            {/* ESQUERDA: FOTO EDITORIAL (Só aparece no computador) */}
            <div className="hidden lg:block lg:w-1/2 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10"></div>
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1200")}
                    alt="Editorial"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-16 left-16 z-20 text-white max-w-md animate-fade-in-up">
                    <h2 className="text-4xl font-serif font-medium mb-4 leading-tight">Suas memórias,<br/> preservadas.</h2>
                    <p className="text-white/80 font-light text-sm tracking-wide border-l-2 border-orange-500 pl-4">
                        Acesse sua galeria exclusiva e reviva cada momento com a qualidade que você merece.
                    </p>
                </div>
            </div>

            {/* DIREITA: FORMULÁRIO LIMPO */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-white">

                {/* Link Voltar */}
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ArrowLeft size={14} /> Voltar ao site
                </Link>

                <div className="w-full max-w-sm animate-fade-in-up delay-100">

                    {/* Logo e Título */}
                    <div className="text-center mb-12">
                        <img src={Logo} alt="Hellô Borges" className="h-10 mx-auto mb-8" />
                        <h1 className="text-3xl font-serif text-zinc-900 mb-3">Área do Cliente</h1>
                        <p className="text-zinc-500 text-sm font-light">Digite suas credenciais para acessar.</p>
                    </div>

                    {/* Mensagem de Erro */}
                    {form.formState.errors.root && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 text-sm flex items-center gap-3 shadow-sm">
                            <AlertCircle size={18} className="text-red-500" />
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* EMAIL */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">Email</Label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                                placeholder="exemplo@email.com"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        {/*<div className="flex justify-between items-end">*/}
                                        {/*    <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">Senha</Label>*/}
                                        {/*    <Link to="/portal/forgot-password" className="text-xs text-zinc-400 hover:text-orange-600 transition-colors font-medium">*/}
                                        {/*        Esqueceu?*/}
                                        {/*    </Link>*/}
                                        {/*</div>*/}
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                                placeholder="••••••••"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full rounded-none h-14 bg-zinc-900 hover:bg-orange-600 text-white uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/20 mt-4"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Acessando...
                                    </div>
                                ) : (
                                    "Entrar na Galeria"
                                )}
                            </Button>

                        </form>
                    </Form>

                    <div className="mt-16 text-center">
                        <p className="text-zinc-400 text-xs mb-3 font-light">Ainda não tem acesso?</p>
                        <Link to="/services" className="text-zinc-900 text-xs font-bold hover:text-orange-600 border-b border-zinc-900 hover:border-orange-600 pb-1 transition-all uppercase tracking-widest">
                            Ver Pacotes Disponíveis
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLoginPage;