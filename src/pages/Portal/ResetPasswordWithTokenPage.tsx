import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { Skeleton } from '@/components/ui/skeleton';

const ResetPasswordWithTokenPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

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
                if (!response.ok) throw new Error();
                setIsTokenValid(true);
            } catch (error) {
                setIsTokenValid(false);
                toast({ variant: 'destructive', title: 'Link Inválido', description: 'Este link de redefinição de senha é inválido ou expirou.' });
            }
        };
        verifyToken();
    }, [token, toast]);


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
            const response = await fetch('/api/portal?action=updatePasswordWithToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newPassword: password }),
            });
            if (!response.ok) throw new Error('Não foi possível atualizar a senha.');

            toast({ title: 'Sucesso!', description: 'A sua senha foi redefinida. Por favor, faça o login.' });
            navigate('/portal/login');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível redefinir a sua senha.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isTokenValid === null) {
            return <Skeleton className="h-64 w-full" />;
        }

        if (isTokenValid === false) {
            return (
                <div className="text-center">
                    <p className="text-destructive">Este link é inválido ou já expirou.</p>
                    <Button variant="link" asChild className="mt-4">
                        <Link to="/portal/forgot-password">Solicitar um novo link</Link>
                    </Button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'A redefinir...' : 'Redefinir Senha'}
                    </Button>
                    <Button variant="link" asChild>
                        <Link to="/portal/login">Voltar para o Login</Link>
                    </Button>
                </CardFooter>
            </form>
        );
    }


    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>
            <Card className="w-full max-w-sm z-10">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl">Crie uma Nova Senha</CardTitle>
                    <CardDescription>
                        Insira e confirme a sua nova senha de acesso.
                    </CardDescription>
                </CardHeader>
                {renderContent()}
            </Card>
        </div>
    );
};

export default ResetPasswordWithTokenPage;