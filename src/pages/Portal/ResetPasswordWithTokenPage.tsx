import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import Header from '@/components/Header';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const ResetPasswordWithTokenPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsTokenValid(false);
                return;
            }
            try {
                const response = await fetch('/api/portal?action=verifyResetToken', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Token inválido');
                setIsTokenValid(true);
            } catch (error) {
                setIsTokenValid(false);
                toast({
                    variant: 'destructive',
                    title: 'Link Inválido ou Expirado',
                    description: 'Este link para redefinição de senha não é válido. Por favor, solicite um novo.',
                });
            }
        };
        verifyToken();
    }, [token, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'As palavras-passe não coincidem' });
            return;
        }
        if (password.length < 6) {
            toast({ variant: 'destructive', title: 'senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/portal?action=updatePasswordWithToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Não foi possível redefinir a senha.');
            }
            toast({
                title: 'senha redefinida com sucesso!',
                description: 'Pode agora fazer login com a sua nova senha.',
                className: 'bg-black/80 text-white border-green-500',
            });
            navigate('/portal/login');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    // Função para renderizar o conteúdo do cartão com base no estado
    const renderCardContent = () => {
        // Estado de Carregamento
        if (isTokenValid === null) {
            return (
                <CardContent className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                    <p className="mt-4 text-white/80">A verificar o link...</p>
                </CardContent>
            );
        }

        // Estado de Token Inválido
        if (isTokenValid === false) {
            return (
                <CardFooter>
                    <Button asChild className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all">
                        <Link to="/portal/login">Voltar para o Login</Link>
                    </Button>
                </CardFooter>
            );
        }

        // Estado de Token Válido (Formulário)
        return (
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Nova senha</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all" type="submit" disabled={isLoading}>
                        {isLoading ? 'A guardar...' : 'Redefinir senha'}
                    </Button>
                </CardFooter>
            </form>
        );
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black text-white p-4">
            <Header isLoginPage={true} />

            <div className="absolute inset-0 z-0">
                <img src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            <Card className="w-full max-w-sm z-10 animate-fade-in-up bg-black/50 backdrop-blur-lg border border-white/10 text-white rounded-3xl">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Criar Nova senha</CardTitle>
                    <CardDescription className="text-white/80">
                        {isTokenValid ? 'Insira a sua nova senha abaixo.' : (isTokenValid === false ? 'Este link é inválido ou expirou.' : 'A verificar...')}
                    </CardDescription>
                </CardHeader>
                {renderCardContent()}
            </Card>
        </div>
    );
};

export default ResetPasswordWithTokenPage;