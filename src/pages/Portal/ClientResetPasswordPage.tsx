import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowLeft, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

const ClientResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para controlar a visibilidade das senhas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    // Removemos o dark mode forçado, pois agora o fundo é branco
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' });
            return;
        }
        if (password.length < 6) {
            toast({ variant: 'destructive', title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.' });
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

            if (!response.ok) throw new Error('Falha ao redefinir a senha.');

            const { token: newToken } = await response.json();
            localStorage.setItem('clientAuthToken', newToken);

            toast({ title: 'Sucesso!', description: 'Senha atualizada. Entrando...' });
            navigate('/portal/gallery');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white text-zinc-900 font-sans">

            {/* COLUNA DA ESQUERDA: FOTO EDITORIAL */}
            <div className="hidden lg:block lg:w-1/2 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1200")}
                    alt="Editorial"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-16 left-16 z-20 text-white max-w-md animate-fade-in-up">
                    <h2 className="text-4xl font-serif font-medium mb-4 leading-tight">Segurança em<br/> primeiro lugar.</h2>
                    <p className="text-white/80 font-light text-sm tracking-wide border-l-2 border-orange-500 pl-4">
                        Defina uma senha segura para proteger suas memórias e garantir que apenas você tenha acesso.
                    </p>
                </div>
            </div>

            {/* COLUNA DA DIREITA: FORMULÁRIO LIMPO */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-white">

                {/* Botão Voltar (Caso queira cancelar/sair) */}
                <Link to="/portal/login" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ArrowLeft size={14} /> Cancelar
                </Link>

                <div className="w-full max-w-sm animate-fade-in-up delay-100">

                    {/* Logo e Título */}
                    <div className="text-center mb-12">
                        <img src={Logo} alt="Hellô Borges" className="h-10 mx-auto mb-8" />
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <Lock size={20} />
                        </div>
                        <h1 className="text-3xl font-serif text-zinc-900 mb-3">Redefinir Senha</h1>
                        <p className="text-zinc-500 text-sm font-light">Crie sua nova senha de acesso.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* NOVA SENHA */}
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">
                                Nova Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 pr-10 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRMAR SENHA */}
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold ml-1">
                                Confirmar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Repita a senha"
                                    className="border-x-0 border-t-0 border-b border-zinc-300 rounded-none px-1 py-3 pr-10 focus-visible:ring-0 focus-visible:border-orange-600 transition-all bg-transparent text-lg text-zinc-900 placeholder:text-zinc-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full rounded-none h-14 bg-zinc-900 hover:bg-orange-600 text-white uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/20 mt-6"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                                </div>
                            ) : (
                                'Salvar e Entrar'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientResetPasswordPage;