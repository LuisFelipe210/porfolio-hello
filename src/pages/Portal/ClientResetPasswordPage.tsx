import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

const ClientResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Atenção', description: 'As senhas não coincidem.' });
            return;
        }
        if (password.length < 6) {
            toast({ variant: 'destructive', title: 'Senha curta', description: 'Mínimo de 6 caracteres.' });
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=resetPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newPassword: password }),
            });

            if (!response.ok) throw new Error('Falha ao redefinir.');

            const { token: newToken } = await response.json();
            localStorage.setItem('clientAuthToken', newToken);

            toast({ title: 'Tudo pronto!', description: 'Senha definida com sucesso.' });
            navigate('/portal/gallery');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Tente novamente mais tarde.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // CORREÇÃO AQUI:
        // Tirei 'h-screen' (altura da tela) e coloquei 'h-full' (altura do container pai).
        // Tirei 'w-full' e bg-zinc-50 porque o layout pai já tem fundo branco.
        <div className="h-full w-full flex flex-col items-center justify-center font-sans text-zinc-900">

            {/* CARTÃO CENTRALIZADO */}
            <div className="w-full max-w-sm bg-white p-8 border border-zinc-200 shadow-xl relative z-10 animate-fade-in-up">

                {/* Detalhe decorativo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-orange-500"></div>

                {/* Botão Voltar (Pode remover se quiser, já que tem menu em cima) */}
                <Link to="/portal/login" className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-900 transition-colors" title="Sair">
                    <ArrowLeft size={18} strokeWidth={1.5} />
                </Link>

                <div className="text-center mb-8 mt-2">
                    {/* Removi a logo daqui pq já tem no Header do Layout */}

                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 text-orange-600 mb-3 border border-orange-100">
                        <ShieldCheck size={20} strokeWidth={1.5} />
                    </div>

                    <h1 className="text-xl font-serif text-zinc-900 mb-1">Defina sua Senha</h1>
                    <p className="text-zinc-500 text-xs font-light px-4">
                        Para sua segurança, crie uma nova senha.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nova Senha */}
                    <div className="space-y-1">
                        <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold pl-1">
                            Nova Senha
                        </Label>
                        <div className="relative group">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Mínimo 6 caracteres"
                                className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-2 pr-10 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-base text-zinc-900 placeholder:text-zinc-300 group-hover:border-zinc-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold pl-1">
                            Confirmar Senha
                        </Label>
                        <div className="relative group">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Repita a senha"
                                className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-2 pr-10 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-base text-zinc-900 placeholder:text-zinc-300 group-hover:border-zinc-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full rounded-none h-12 bg-zinc-900 hover:bg-orange-600 text-white uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-none hover:shadow-lg mt-6"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                            </div>
                        ) : (
                            'Confirmar e Acessar'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ClientResetPasswordPage;