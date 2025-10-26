import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Força o tema escuro na página de login
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);


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
                description: 'A redirecionar para o painel...',
                className: 'bg-black/80 text-white border-green-500',
            });

            // Redireciona para a página de clientes após o login
            navigate('/admin');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro de login',
                description: 'Utilizador ou palavra-passe incorretos.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black text-white p-4">
            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            {/* Formulário de Login */}
            <Card className="w-full max-w-sm z-10 animate-fade-in-up bg-black/50 backdrop-blur-lg border border-white/10 text-white rounded-3xl">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Acesso ao Painel</CardTitle>
                    <CardDescription className="text-white/80">
                        Faça login para gerir o seu website.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Utilizador</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="O seu utilizador"
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Palavra-passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all" type="submit" disabled={isLoading}>
                            {isLoading ? 'A entrar...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;