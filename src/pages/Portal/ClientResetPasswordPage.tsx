import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";

const ClientResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

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
            // Atualiza o token no localStorage com o novo que não tem a flag de reset
            localStorage.setItem('clientAuthToken', newToken);

            toast({ title: 'Sucesso!', description: 'A sua senha foi atualizada. A aceder à sua galeria...' });
            navigate('/portal/gallery');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível redefinir a sua senha. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full">
            <Card className="w-full max-w-sm z-10 animate-fade-in-up">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
                    <CardDescription>
                        Por segurança, por favor, crie uma nova senha para o seu primeiro acesso.
                    </CardDescription>
                </CardHeader>
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
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'A guardar...' : 'Guardar Nova Senha'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ClientResetPasswordPage;