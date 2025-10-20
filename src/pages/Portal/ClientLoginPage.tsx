import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Importar o Link
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { ArrowLeft } from 'lucide-react'; // 2. Importar o ícone

const ClientLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/portal?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error('Credenciais inválidas');

            const { token } = await response.json();
            localStorage.setItem('clientAuthToken', token);

            toast({ title: 'Login bem-sucedido!', description: 'A aceder à sua galeria...' });
            navigate('/portal/gallery');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro de login', description: 'Email ou senha incorretos.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background">
            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Formulário de Login */}
            <Card className="w-full max-w-sm z-10 animate-fade-in-up">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl">Portal do Cliente</CardTitle>
                    <CardDescription>
                        Aceda à sua galeria privada para selecionar as suas fotos.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="O seu email"
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
                                placeholder="••••••••"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" type="submit" disabled={isLoading}>
                            {isLoading ? 'A entrar...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* 3. Botão "Voltar" adicionado aqui */}
            <div className="absolute bottom-8 text-center w-full z-10">
                <Button variant="link" asChild className="text-white/70 hover:text-white transition-colors">
                    <Link to="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar à página principal
                    </Link>
                </Button>
            </div>

        </div>
    );
};

export default ClientLoginPage;