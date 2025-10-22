import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils'; // <-- CORREÇÃO: Importado

const ResetPasswordWithTokenPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`/api/portal?action=verify-token&token=${token}`);
                if (response.ok) {
                    setIsValidToken(true);
                } else {
                    setIsValidToken(false);
                    toast.error("Token inválido ou expirado.", {
                        description: "Por favor, solicite um novo link para redefinir sua senha.",
                    });
                }
            } catch (error) {
                setIsValidToken(false);
                toast.error("Erro ao verificar o token.");
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch('/api/portal?action=reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao redefinir a senha.');
            }

            toast.success("Senha redefinida com sucesso!", {
                description: "Você já pode fazer login com sua nova senha.",
            });
            navigate('/portal/login');

        } catch (error: any) {
            toast.error("Erro", {
                description: error.message || 'Não foi possível processar sua solicitação.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidToken === null) {
        return <div className="flex items-center justify-center min-h-screen">Verificando...</div>;
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background">
            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    // v-- CORREÇÃO APLICADA AQUI --v
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Formulário */}
            <Card className="w-full max-w-sm z-10 animate-fade-in-up">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
                    <CardDescription>
                        {isValidToken ? "Crie uma nova senha para sua conta." : "O link que você usou é inválido ou expirou."}
                    </CardDescription>
                </CardHeader>
                {isValidToken ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                            </Button>
                        </CardFooter>
                    </form>
                ) : (
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link to="/portal/forgot-password">Solicitar Novo Link</Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default ResetPasswordWithTokenPage;