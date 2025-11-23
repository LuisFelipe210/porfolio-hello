import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
    username: z.string().min(1, { message: "O utilizador é obrigatório." }),
    password: z.string().min(1, { message: "A palavra-passe é obrigatória." }),
});

const AdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // Garante que saia do dark mode
        document.documentElement.classList.remove('dark');
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: localStorage.getItem('lastUsername') || "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        form.clearErrors();

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenciais inválidas');
            }

            const { token } = await response.json();
            localStorage.setItem('authToken', token);
            localStorage.setItem('lastUsername', data.username);

            toast({
                title: 'Bem-vindo de volta!',
                description: 'A carregar o painel...',
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

    return (
        <div className="min-h-screen w-full flex bg-white text-zinc-900 font-sans">

            {/* ESQUERDA: FOTO DESTAQUE */}
            <div className="hidden lg:block lg:w-1/2 relative bg-zinc-100 overflow-hidden border-r border-zinc-200">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1200")}
                    alt="Admin Background"
                    className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute bottom-16 left-16 z-20 bg-white p-8 max-w-md shadow-2xl">
                    <h2 className="text-3xl font-serif text-zinc-900 mb-2">Gestão & Curadoria.</h2>
                    <p className="text-zinc-500 font-light text-sm">
                        Painel administrativo para controle total do seu portfólio e clientes.
                    </p>
                </div>
            </div>

            {/* DIREITA: FORMULÁRIO LIMPO */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-white">

                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ArrowLeft size={14} /> Voltar ao site
                </Link>

                <div className="w-full max-w-sm animate-fade-in-up">

                    <div className="text-center mb-12">
                        <img src={Logo} alt="Hellô Borges" className="h-10 mx-auto mb-8" />
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 text-orange-600 mb-4 border border-zinc-100">
                            <Lock size={20} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-serif text-zinc-900 mb-2">Acesso Restrito</h1>
                        <p className="text-zinc-500 text-sm font-light">Entre com suas credenciais de administrador.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* USUÁRIO */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">Utilizador</Label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                                placeholder="seu.usuario"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* SENHA */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">Senha</Label>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 pr-10 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* BOTÃO */}
                            <Button
                                type="submit"
                                className="w-full rounded-none h-14 bg-zinc-900 hover:bg-orange-600 text-white uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-none hover:shadow-lg mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                                    </div>
                                ) : (
                                    "Acessar Painel"
                                )}
                            </Button>

                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;