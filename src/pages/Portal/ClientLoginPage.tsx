import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import { optimizeCloudinaryUrl } from '@/lib/utils';
import Header from '@/components/Header';

const ClientLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    // O useEffect que forçava o tema escuro foi removido para permitir a troca de tema.

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

            const { token, mustResetPassword } = await response.json();
            localStorage.setItem('clientAuthToken', token);

            toast({
                title: 'Login bem-sucedido!',
                description: 'A redirecionar para o seu portal...',
                variant: "success"
            });

            if (mustResetPassword) {
                navigate('/portal/reset-password');
            } else {
                navigate('/portal/gallery');
            }
        } catch (error) {
            setLoginError('Email ou senha incorretos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- CORREÇÃO: A div principal agora usa bg-background para o tema ---
        <div className="relative flex items-center justify-center min-h-screen bg-background text-foreground p-4">

            <Header isLoginPage={true} />

            {/* --- CORREÇÃO: A IMAGEM DE FUNDO FOI ADICIONADA NOVAMENTE --- */}
            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            <Card className="w-full max-w-sm z-10 animate-fade-in-up bg-card/50 backdrop-blur-lg border rounded-3xl">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Portal do Cliente</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                        Aceda à sua galeria privada para selecionar as suas fotos.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="O seu email de acesso"
                                className="bg-input border-border rounded-xl h-12 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-black dark:text-white">Palavra-passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="bg-input border-border rounded-xl h-12 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
                            />
                            {loginError && (
                                <div className="text-sm text-red-600 mt-1">
                                    {loginError}
                                </div>
                            )}
                            {/*<div className="text-right -mt-1">*/}
                            {/*    <Link to="/portal/forgot-password" className="text-sm text-gray-900 dark:text-muted-foreground hover:text-foreground hover:underline transition-colors px-1">*/}
                            {/*        Esqueceu a senha?*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
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

export default ClientLoginPage;