import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon } from 'lucide-react';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const { token } = await response.json();
            localStorage.setItem('authToken', token);

            toast({
                title: 'Login bem-sucedido!',
                description: 'Redirecionando para o painel...',
            });

            navigate('/admin/portfolio');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro de login',
                description: 'Usuário ou senha incorretos.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div className="absolute top-4 right-4">
                <Button onClick={toggleTheme} variant="outline" size="icon">
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>
            <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Login do Administrador</CardTitle>
                    <CardDescription>
                        Acesse o painel para gerenciar seu portfólio.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;